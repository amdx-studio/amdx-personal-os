import { BrowserWindow, app, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
//#region electron/services/jsonStore.ts
function getDataDir() {
	return path.join(app.getPath("userData"), "data");
}
async function ensureDataDir() {
	const dir = getDataDir();
	await fs.mkdir(dir, { recursive: true });
}
function getFilePath(fileName) {
	return path.join(getDataDir(), fileName);
}
/**
* Membaca file JSON. Jika file belum ada, otomatis dibuat
* dengan nilai default yang diberikan.
*/
async function readJsonFile(fileName, defaultValue) {
	await ensureDataDir();
	const filePath = getFilePath(fileName);
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		return JSON.parse(raw);
	} catch (error) {
		if (error.code === "ENOENT") {
			await writeJsonFile(fileName, defaultValue);
			return defaultValue;
		}
		throw new Error(`Gagal membaca ${fileName}: ${error.message}`);
	}
}
/**
* Menulis file JSON secara atomic: tulis ke file sementara
* dulu, lalu rename. Mencegah file korup jika terjadi crash
* di tengah proses penulisan.
*/
async function writeJsonFile(fileName, data) {
	await ensureDataDir();
	const filePath = getFilePath(fileName);
	const tempPath = `${filePath}.tmp`;
	const content = JSON.stringify(data, null, 2);
	await fs.writeFile(tempPath, content, "utf-8");
	await fs.rename(tempPath, filePath);
}
//#endregion
//#region src/types/settings.ts
var DEFAULT_SETTINGS = {
	theme: "system",
	language: "id",
	hasCompletedOnboarding: false
};
//#endregion
//#region electron/services/settingsService.ts
var SETTINGS_FILE = "settings.json";
async function getSettings() {
	return readJsonFile(SETTINGS_FILE, DEFAULT_SETTINGS);
}
async function saveSettings(settings) {
	await writeJsonFile(SETTINGS_FILE, settings);
}
//#endregion
//#region electron/ipc/settingsHandlers.ts
function registerSettingsHandlers() {
	ipcMain.handle("settings:get", async () => {
		return getSettings();
	});
	ipcMain.handle("settings:save", async (_event, settings) => {
		await saveSettings(settings);
		return true;
	});
}
//#endregion
//#region electron/services/tasksService.ts
var TASKS_FILE = "tasks.json";
var DEFAULT_TASKS = [];
async function getTasks() {
	return readJsonFile(TASKS_FILE, DEFAULT_TASKS);
}
async function createTask(input) {
	const tasks = await getTasks();
	const newTask = {
		id: randomUUID(),
		title: input.title,
		description: input.description ?? "",
		category: input.category,
		deadline: input.deadline ?? null,
		status: input.status ?? "belum_dimulai",
		priority: input.priority ?? "medium",
		progress: input.progress ?? 0,
		notes: input.notes ?? "",
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		completedAt: null,
		archived: false,
		kuliahDetails: input.kuliahDetails,
		jokiDetails: input.jokiDetails,
		klienDetails: input.klienDetails
	};
	await writeJsonFile(TASKS_FILE, [...tasks, newTask]);
	return newTask;
}
async function updateTask(input) {
	const tasks = await getTasks();
	const index = tasks.findIndex((t) => t.id === input.id);
	if (index === -1) throw new Error(`Task ${input.id} tidak ditemukan`);
	const existing = tasks[index];
	const merged = {
		...existing,
		...input
	};
	if (input.status && input.status !== existing.status) {
		if (input.status === "selesai") {
			merged.completedAt = (/* @__PURE__ */ new Date()).toISOString();
			merged.progress = 100;
		} else if (existing.status === "selesai") merged.completedAt = null;
	}
	const updated = [...tasks];
	updated[index] = merged;
	await writeJsonFile(TASKS_FILE, updated);
	return merged;
}
async function deleteTask(id) {
	await writeJsonFile(TASKS_FILE, (await getTasks()).filter((task) => task.id !== id));
}
async function duplicateTask(id) {
	const tasks = await getTasks();
	const original = tasks.find((t) => t.id === id);
	if (!original) throw new Error(`Task ${id} tidak ditemukan`);
	const copy = {
		...original,
		id: randomUUID(),
		title: `${original.title} (Copy)`,
		status: "belum_dimulai",
		progress: 0,
		completedAt: null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		archived: false
	};
	await writeJsonFile(TASKS_FILE, [...tasks, copy]);
	return copy;
}
async function markTaskDone(id) {
	return updateTask({
		id,
		status: "selesai",
		progress: 100
	});
}
async function extendDeadline(id, newDeadline) {
	return updateTask({
		id,
		deadline: newDeadline
	});
}
async function archiveTask(id, archived = true) {
	return updateTask({
		id,
		archived
	});
}
//#endregion
//#region electron/ipc/tasksHandlers.ts
function registerTasksHandlers() {
	ipcMain.handle("tasks:get", async () => {
		return getTasks();
	});
	ipcMain.handle("tasks:create", async (_event, input) => {
		return createTask(input);
	});
	ipcMain.handle("tasks:update", async (_event, input) => {
		return updateTask(input);
	});
	ipcMain.handle("tasks:delete", async (_event, id) => {
		await deleteTask(id);
		return true;
	});
	ipcMain.handle("tasks:duplicate", async (_event, id) => {
		return duplicateTask(id);
	});
	ipcMain.handle("tasks:markDone", async (_event, id) => {
		return markTaskDone(id);
	});
	ipcMain.handle("tasks:extendDeadline", async (_event, id, newDeadline) => {
		return extendDeadline(id, newDeadline);
	});
	ipcMain.handle("tasks:archive", async (_event, id, archived) => {
		return archiveTask(id, archived);
	});
}
//#endregion
//#region electron/services/notesService.ts
var NOTES_FILE = "notes.json";
var DEFAULT_NOTES = [];
async function getNotes() {
	return readJsonFile(NOTES_FILE, DEFAULT_NOTES);
}
async function createNote(input) {
	const notes = await getNotes();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const newNote = {
		id: randomUUID(),
		title: input.title,
		content: input.content,
		createdAt: now,
		updatedAt: now
	};
	await writeJsonFile(NOTES_FILE, [...notes, newNote]);
	return newNote;
}
async function updateNote(id, input) {
	await writeJsonFile(NOTES_FILE, (await getNotes()).map((note) => {
		if (note.id !== id) return note;
		return {
			...note,
			...input,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	}));
}
async function deleteNote(id) {
	await writeJsonFile(NOTES_FILE, (await getNotes()).filter((note) => note.id !== id));
}
//#endregion
//#region electron/ipc/notesHandlers.ts
function registerNotesHandlers() {
	ipcMain.handle("notes:get", async () => {
		return getNotes();
	});
	ipcMain.handle("notes:create", async (_event, input) => {
		return createNote(input);
	});
	ipcMain.handle("notes:update", async (_event, id, input) => {
		await updateNote(id, input);
		return true;
	});
	ipcMain.handle("notes:delete", async (_event, id) => {
		await deleteNote(id);
		return true;
	});
}
//#endregion
//#region electron/services/financeService.ts
var FINANCE_FILE = "finance.json";
var DEFAULT_TRANSACTIONS = [];
async function getTransactions() {
	return readJsonFile(FINANCE_FILE, DEFAULT_TRANSACTIONS);
}
async function createTransaction(input) {
	const transactions = await getTransactions();
	const newTransaction = {
		id: randomUUID(),
		type: input.type,
		amount: input.amount,
		category: input.category,
		date: input.date,
		description: input.description ?? "",
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	await writeJsonFile(FINANCE_FILE, [...transactions, newTransaction]);
	return newTransaction;
}
async function updateTransaction(id, input) {
	await writeJsonFile(FINANCE_FILE, (await getTransactions()).map((transaction) => transaction.id === id ? {
		...transaction,
		...input
	} : transaction));
}
async function deleteTransaction(id) {
	await writeJsonFile(FINANCE_FILE, (await getTransactions()).filter((transaction) => transaction.id !== id));
}
//#endregion
//#region electron/ipc/financeHandlers.ts
function registerFinanceHandlers() {
	ipcMain.handle("finance:get", async () => {
		return getTransactions();
	});
	ipcMain.handle("finance:create", async (_event, input) => {
		return createTransaction(input);
	});
	ipcMain.handle("finance:update", async (_event, id, input) => {
		await updateTransaction(id, input);
		return true;
	});
	ipcMain.handle("finance:delete", async (_event, id) => {
		await deleteTransaction(id);
		return true;
	});
}
//#endregion
//#region electron/services/goalsService.ts
var GOALS_FILE = "goals.json";
var DEFAULT_GOALS = [];
async function getGoals() {
	return readJsonFile(GOALS_FILE, DEFAULT_GOALS);
}
async function createGoal(input) {
	const goals = await getGoals();
	const newGoal = {
		id: randomUUID(),
		title: input.title,
		targetValue: input.targetValue,
		currentValue: 0,
		unit: input.unit,
		deadline: input.deadline ?? null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	await writeJsonFile(GOALS_FILE, [...goals, newGoal]);
	return newGoal;
}
async function updateGoal(id, input) {
	await writeJsonFile(GOALS_FILE, (await getGoals()).map((goal) => goal.id === id ? {
		...goal,
		...input
	} : goal));
}
async function deleteGoal(id) {
	await writeJsonFile(GOALS_FILE, (await getGoals()).filter((goal) => goal.id !== id));
}
//#endregion
//#region electron/ipc/goalsHandlers.ts
function registerGoalsHandlers() {
	ipcMain.handle("goals:get", async () => {
		return getGoals();
	});
	ipcMain.handle("goals:create", async (_event, input) => {
		return createGoal(input);
	});
	ipcMain.handle("goals:update", async (_event, id, input) => {
		await updateGoal(id, input);
		return true;
	});
	ipcMain.handle("goals:delete", async (_event, id) => {
		await deleteGoal(id);
		return true;
	});
}
//#endregion
//#region electron/ipc/index.ts
function registerAllIpcHandlers() {
	registerSettingsHandlers();
	registerTasksHandlers();
	registerNotesHandlers();
	registerFinanceHandlers();
	registerGoalsHandlers();
}
//#endregion
//#region electron/main.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
var RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
var mainWindow = null;
function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 1024,
		minHeight: 640,
		title: "AMDX Personal OS",
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true
		}
	});
	if (VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(VITE_DEV_SERVER_URL);
		mainWindow.webContents.openDevTools();
	} else mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
ipcMain.handle("app:get-version", () => app.getVersion());
registerAllIpcHandlers();
app.whenReady().then(createMainWindow);
//#endregion
export { MAIN_DIST, RENDERER_DIST, VITE_DEV_SERVER_URL };
