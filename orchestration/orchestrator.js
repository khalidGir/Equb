const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { spawn } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const schemaTasksPath = path.join(projectRoot, 'tasks', 'schema', 'tasks.json');
const altTasksPath = path.join(projectRoot, 'tasks', 'tasks.json');
const agentsPath = path.join(projectRoot, 'tasks', 'schema', 'agents.json');
const logsDir = path.join(projectRoot, 'tasks', 'logs');
const historyLog = path.join(logsDir, 'history.log');

async function ensureLogsDir() {
  try { await fsp.mkdir(logsDir, { recursive: true }); } catch (e) { }
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  try { fs.appendFileSync(historyLog, line + '\n'); } catch (e) { /* ignore */ }
  console.log(line);
}

async function loadConfigs() {
  // Load preferred tasks schema, fall back to tasks/tasks.json
  let tasksData;
  try { tasksData = JSON.parse(await fsp.readFile(schemaTasksPath, 'utf8')); }
  catch (e) {
    try { tasksData = JSON.parse(await fsp.readFile(altTasksPath, 'utf8')); }
    catch (err) { throw new Error('Cannot find tasks definition in schema or root tasks.json'); }
  }

  const agentsData = JSON.parse(await fsp.readFile(agentsPath, 'utf8'));

  const tasksArray = Array.isArray(tasksData.tasks) ? tasksData.tasks : [];
  const tasksById = new Map(tasksArray.map(t => [t.id, t]));

  return { tasksArray, tasksById, agents: agentsData.agents || {}, rawTasks: tasksData };
}

async function validateAssignments(tasksById, agents) {
  const missing = [];
  for (const [agentKey, agent] of Object.entries(agents)) {
    if (!Array.isArray(agent.tasks)) continue;
    for (const tid of agent.tasks) {
      if (!tasksById.has(tid)) missing.push({ agent: agentKey, task: tid });
    }
  }
  return missing;
}

function spawnCommand(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    log(`Spawning: ${cmd} ${args.join(' ')}`);
    const p = spawn(cmd, args, Object.assign({ stdio: 'inherit' }, opts));
    p.on('error', (err) => {
      log(`Command error: ${err.message} (simulating success)`);
      resolve({ code: 0, simulated: true });
    });
    p.on('exit', (code) => resolve({ code }));
  });
}

async function callAgent(agent, task) {
  // Decide how to call agents — prefer CLI, otherwise simulate
  log(`Task plan: '${task.id}' -> Agent '${agent.name || agent.id || 'unknown'}'`);
  const id = (agent.id || '').toLowerCase();
  const p = (agent.path || '').toLowerCase();

  // If the agent specifies an explicit CLI path, prefer it
  if (agent.cli) {
    const cliPath = agent.cli;
    if (id.includes('gemini') || p.includes('gemini')) {
      return spawnCommand(cliPath, ['run-task', '--id', task.id]);
    }
    if (id.includes('qwen') || p.includes('qwen')) {
      return spawnCommand(cliPath, ['exec', '--task', task.id]);
    }
    // generic call for other CLIs
    return spawnCommand(cliPath, ['run', '--task', task.id]);
  }

  if (id.includes('gemini') || p.includes('gemini')) {
    return spawnCommand('gemini-cli', ['run-task', '--id', task.id]);
  }
  if (id.includes('qwen') || p.includes('qwen')) {
    return spawnCommand('qwen-cli', ['exec', '--task', task.id]);
  }
  if (id.includes('deepseek') || p.includes('deepseek')) {
    // Placeholder for web API call — simulate
    log(`Calling DeepSeek web API placeholder for ${task.id}`);
    return new Promise((res) => setTimeout(() => res({ code: 0, simulated: true }), 600));
  }
  if (id.includes('lingma') || id.includes('copilot')) {
    const cli = id.includes('lingma') ? 'lingma-cli' : 'copilot-cli';
    return spawnCommand(cli, ['run', '--task', task.id]);
  }

  log(`No known CLI for agent '${agent.name || agent.id}', simulating execution.`);
  return new Promise((res) => setTimeout(() => res({ code: 0, simulated: true }), 300));
}

async function runTask(id) {
  await ensureLogsDir();
  const { tasksArray, tasksById, agents } = await loadConfigs();
  const task = tasksById.get(id);
  if (!task) throw new Error(`Task not found: ${id}`);

  // Find owning agent by scanning agents' tasks lists
  let owner = null;
  for (const [k, a] of Object.entries(agents)) {
    if (Array.isArray(a.tasks) && a.tasks.includes(id)) { owner = a; break; }
  }

  if (!owner) {
    // Try simple routing by prefix -> role mapping from tasks schema
    try {
      const raw = JSON.parse(await fsp.readFile(schemaTasksPath, 'utf8'));
      const roleMap = raw.agent_routing || {};
      const prefix = id.split('.')[0];
      const role = { 'documentation': 'spec_to_code', 'development': 'code_generation', 'build': 'refinement', 'orchestration': 'review' }[prefix];
      const agentKey = role ? roleMap[role] : null;
      if (agentKey && agents[agentKey]) owner = agents[agentKey];
    } catch (e) { /* ignore */ }
  }

  if (!owner) throw new Error(`No agent assigned for task ${id}`);

  log(`Running task '${id}' with agent '${owner.name || owner.id}'`);
  const result = await callAgent(owner, task);
  log(`Task '${id}' finished (code=${result && result.code})`);
  return result;
}

async function runAllTasks() {
  await ensureLogsDir();
  const { tasksArray } = await loadConfigs();
  log(`Running ${tasksArray.length} tasks in sequence.`);
  for (const t of tasksArray) {
    try { await runTask(t.id); }
    catch (e) { log(`Error running ${t.id}: ${e.message}`); }
  }
  log('runAllTasks completed');
}

module.exports = { loadConfigs, validateAssignments, runTask, runAllTasks, ensureLogsDir };

// If this file executed directly, perform validation and run all tasks
if (require.main === module) {
  (async () => {
    try {
      await ensureLogsDir();
      const { tasksById, agents } = await loadConfigs();
      const missing = await validateAssignments(tasksById, agents);
      if (missing.length) {
        log('Validation issues:');
        missing.forEach(m => log(`- Agent '${m.agent}' references missing task '${m.task}'`));
      } else {
        log('Validation OK');
      }
      await runAllTasks();
      process.exit(0);
    } catch (err) {
      console.error('Orchestrator error:', err.message);
      process.exit(1);
    }
  })();
}