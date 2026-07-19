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
		completed: false,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	await writeJsonFile(TASKS_FILE, [...tasks, newTask]);
	return newTask;
}
async function toggleTask(id) {
	await writeJsonFile(TASKS_FILE, (await getTasks()).map((task) => task.id === id ? {
		...task,
		completed: !task.completed
	} : task));
}
async function deleteTask(id) {
	await writeJsonFile(TASKS_FILE, (await getTasks()).filter((task) => task.id !== id));
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
	ipcMain.handle("tasks:toggle", async (_event, id) => {
		await toggleTask(id);
		return true;
	});
	ipcMain.handle("tasks:delete", async (_event, id) => {
		await deleteTask(id);
		return true;
	});
}
//#endregion
//#region electron/services/habitsService.ts
var HABITS_FILE = "habits.json";
var DEFAULT_HABITS = [];
async function getHabits() {
	return readJsonFile(HABITS_FILE, DEFAULT_HABITS);
}
async function createHabit(input) {
	const habits = await getHabits();
	const newHabit = {
		id: randomUUID(),
		name: input.name,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		completedDates: []
	};
	await writeJsonFile(HABITS_FILE, [...habits, newHabit]);
	return newHabit;
}
async function toggleHabitToday(id) {
	const habits = await getHabits();
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	await writeJsonFile(HABITS_FILE, habits.map((habit) => {
		if (habit.id !== id) return habit;
		const completedDates = habit.completedDates.includes(today) ? habit.completedDates.filter((date) => date !== today) : [...habit.completedDates, today];
		return {
			...habit,
			completedDates
		};
	}));
}
async function deleteHabit(id) {
	await writeJsonFile(HABITS_FILE, (await getHabits()).filter((habit) => habit.id !== id));
}
//#endregion
//#region electron/ipc/habitsHandlers.ts
function registerHabitsHandlers() {
	ipcMain.handle("habits:get", async () => {
		return getHabits();
	});
	ipcMain.handle("habits:create", async (_event, input) => {
		return createHabit(input);
	});
	ipcMain.handle("habits:toggleToday", async (_event, id) => {
		await toggleHabitToday(id);
		return true;
	});
	ipcMain.handle("habits:delete", async (_event, id) => {
		await deleteHabit(id);
		return true;
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
//#region electron/services/calendarService.ts
var CALENDAR_FILE = "calendar.json";
var DEFAULT_EVENTS = [];
async function getEvents() {
	return readJsonFile(CALENDAR_FILE, DEFAULT_EVENTS);
}
async function createEvent(input) {
	const events = await getEvents();
	const newEvent = {
		id: randomUUID(),
		title: input.title,
		date: input.date,
		time: input.time ?? null,
		description: input.description ?? "",
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	await writeJsonFile(CALENDAR_FILE, [...events, newEvent]);
	return newEvent;
}
async function updateEvent(id, input) {
	await writeJsonFile(CALENDAR_FILE, (await getEvents()).map((event) => event.id === id ? {
		...event,
		...input
	} : event));
}
async function deleteEvent(id) {
	await writeJsonFile(CALENDAR_FILE, (await getEvents()).filter((event) => event.id !== id));
}
//#endregion
//#region electron/ipc/calendarHandlers.ts
function registerCalendarHandlers() {
	ipcMain.handle("calendar:get", async () => {
		return getEvents();
	});
	ipcMain.handle("calendar:create", async (_event, input) => {
		return createEvent(input);
	});
	ipcMain.handle("calendar:update", async (_event, id, input) => {
		await updateEvent(id, input);
		return true;
	});
	ipcMain.handle("calendar:delete", async (_event, id) => {
		await deleteEvent(id);
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
//#region src/types/prayerSettings.ts
var DEFAULT_PRAYER_SETTINGS = {
	cityName: "Jakarta",
	latitude: -6.2088,
	longitude: 106.8456,
	timezoneOffset: 7,
	calculationMethod: "Kemenag",
	asrMethod: "Shafi"
};
//#endregion
//#region electron/services/prayerSettingsService.ts
var PRAYER_SETTINGS_FILE = "prayerSettings.json";
async function getPrayerSettings() {
	return readJsonFile(PRAYER_SETTINGS_FILE, DEFAULT_PRAYER_SETTINGS);
}
async function savePrayerSettings(settings) {
	await writeJsonFile(PRAYER_SETTINGS_FILE, settings);
	return true;
}
//#endregion
//#region electron/ipc/prayerHandlers.ts
function registerPrayerHandlers() {
	ipcMain.handle("prayer:getSettings", async () => {
		return getPrayerSettings();
	});
	ipcMain.handle("prayer:saveSettings", async (_event, settings) => {
		return savePrayerSettings(settings);
	});
}
//#endregion
//#region electron/ipc/index.ts
function registerAllIpcHandlers() {
	registerSettingsHandlers();
	registerTasksHandlers();
	registerHabitsHandlers();
	registerNotesHandlers();
	registerCalendarHandlers();
	registerFinanceHandlers();
	registerGoalsHandlers();
	registerPrayerHandlers();
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
