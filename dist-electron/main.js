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
function addDays(days) {
	const date = /* @__PURE__ */ new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
}
/**
* Data default yang dipakai saat finance.json belum ada sama sekali,
* atau saat migrasi dari format lama perlu mengisi section yang belum
* pernah tersimpan sebelumnya. Nilainya sengaja disamakan dengan data
* contoh yang dulu hardcoded di FinanceView.vue, supaya tampilan tidak
* mendadak kosong setelah migrasi.
*/
function createDefaultFinanceData() {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		transactions: [],
		accounts: [
			{
				id: "cash",
				label: "Cash",
				iconKey: "cash",
				amount: 85e4,
				createdAt: now
			},
			{
				id: "bank",
				label: "Bank",
				iconKey: "bank",
				amount: 42e5,
				createdAt: now
			},
			{
				id: "ewallet",
				label: "E-Wallet",
				iconKey: "ewallet",
				amount: 35e4,
				createdAt: now
			},
			{
				id: "savings",
				label: "Savings",
				iconKey: "savings",
				amount: 6e6,
				createdAt: now
			},
			{
				id: "investment",
				label: "Investments",
				iconKey: "investment",
				amount: 3e6,
				createdAt: now
			}
		],
		budgets: [
			{
				id: randomUUID(),
				category: "Makan",
				limit: 15e5,
				createdAt: now
			},
			{
				id: randomUUID(),
				category: "Transport",
				limit: 5e5,
				createdAt: now
			},
			{
				id: randomUUID(),
				category: "Internet",
				limit: 3e5,
				createdAt: now
			}
		],
		goals: [{
			id: randomUUID(),
			name: "Laptop Baru",
			target: 15e6,
			current: 75e5,
			createdAt: now
		}],
		bills: [
			{
				id: randomUUID(),
				name: "Internet",
				amount: 35e4,
				dueDate: addDays(3),
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "Listrik",
				amount: 25e4,
				dueDate: addDays(5),
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "Domain",
				amount: 18e4,
				dueDate: addDays(9),
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "Hosting",
				amount: 22e4,
				dueDate: addDays(12),
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "Spotify",
				amount: 59e3,
				dueDate: addDays(15),
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "Netflix",
				amount: 12e4,
				dueDate: addDays(20),
				createdAt: now
			}
		],
		wishlist: [
			{
				id: randomUUID(),
				name: "Monitor",
				price: 35e5,
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "Mechanical Keyboard",
				price: 12e5,
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "iPad",
				price: 9e6,
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "Camera",
				price: 12e6,
				createdAt: now
			}
		],
		assets: [
			{
				id: randomUUID(),
				name: "Laptop",
				value: 15e6,
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "Motor",
				value: 12e6,
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "HP",
				value: 6e6,
				createdAt: now
			},
			{
				id: randomUUID(),
				name: "Monitor",
				value: 35e5,
				createdAt: now
			}
		]
	};
}
function isFinanceData(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	const data = value;
	return Array.isArray(data.transactions) && Array.isArray(data.accounts) && Array.isArray(data.budgets) && Array.isArray(data.goals) && Array.isArray(data.bills) && Array.isArray(data.wishlist) && Array.isArray(data.assets);
}
/**
* Migrasi finance.json:
* - Format lama: file HANYA berisi array transaksi ([{...}, {...}]).
* - Format baru: file berisi object dengan 7 section.
* Data transaksi lama tetap dipertahankan; section lain diisi default.
*/
function migrateFinanceData(raw) {
	const defaults = createDefaultFinanceData();
	if (Array.isArray(raw)) return {
		...defaults,
		transactions: raw
	};
	const partial = raw && typeof raw === "object" ? raw : {};
	return {
		transactions: Array.isArray(partial.transactions) ? partial.transactions : defaults.transactions,
		accounts: Array.isArray(partial.accounts) ? partial.accounts : defaults.accounts,
		budgets: Array.isArray(partial.budgets) ? partial.budgets : defaults.budgets,
		goals: Array.isArray(partial.goals) ? partial.goals : defaults.goals,
		bills: Array.isArray(partial.bills) ? partial.bills : defaults.bills,
		wishlist: Array.isArray(partial.wishlist) ? partial.wishlist : defaults.wishlist,
		assets: Array.isArray(partial.assets) ? partial.assets : defaults.assets
	};
}
async function loadFinanceData() {
	const raw = await readJsonFile(FINANCE_FILE, createDefaultFinanceData());
	if (isFinanceData(raw)) return raw;
	const migrated = migrateFinanceData(raw);
	await writeJsonFile(FINANCE_FILE, migrated);
	return migrated;
}
async function persistFinanceData(data) {
	await writeJsonFile(FINANCE_FILE, data);
}
async function getTransactions() {
	return (await loadFinanceData()).transactions;
}
async function createTransaction(input) {
	const data = await loadFinanceData();
	const newTransaction = {
		id: randomUUID(),
		type: input.type,
		amount: input.amount,
		category: input.category,
		date: input.date,
		description: input.description ?? "",
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	data.transactions = [...data.transactions, newTransaction];
	await persistFinanceData(data);
	return newTransaction;
}
async function updateTransaction(id, input) {
	const data = await loadFinanceData();
	data.transactions = data.transactions.map((transaction) => transaction.id === id ? {
		...transaction,
		...input
	} : transaction);
	await persistFinanceData(data);
}
async function deleteTransaction(id) {
	const data = await loadFinanceData();
	data.transactions = data.transactions.filter((transaction) => transaction.id !== id);
	await persistFinanceData(data);
}
async function getAccounts() {
	return (await loadFinanceData()).accounts;
}
async function createAccount(input) {
	const data = await loadFinanceData();
	const newAccount = {
		id: input.id ?? randomUUID(),
		label: input.label,
		iconKey: input.iconKey,
		amount: input.amount,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	data.accounts = [...data.accounts, newAccount];
	await persistFinanceData(data);
	return newAccount;
}
async function updateAccount(id, input) {
	const data = await loadFinanceData();
	data.accounts = data.accounts.map((account) => account.id === id ? {
		...account,
		...input
	} : account);
	await persistFinanceData(data);
}
async function deleteAccount(id) {
	const data = await loadFinanceData();
	data.accounts = data.accounts.filter((account) => account.id !== id);
	await persistFinanceData(data);
}
async function getBudgets() {
	return (await loadFinanceData()).budgets;
}
async function createBudget(input) {
	const data = await loadFinanceData();
	const newBudget = {
		id: randomUUID(),
		category: input.category,
		limit: input.limit,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	data.budgets = [...data.budgets, newBudget];
	await persistFinanceData(data);
	return newBudget;
}
async function updateBudget(id, input) {
	const data = await loadFinanceData();
	data.budgets = data.budgets.map((budget) => budget.id === id ? {
		...budget,
		...input
	} : budget);
	await persistFinanceData(data);
}
async function deleteBudget(id) {
	const data = await loadFinanceData();
	data.budgets = data.budgets.filter((budget) => budget.id !== id);
	await persistFinanceData(data);
}
async function getSavingsGoals() {
	return (await loadFinanceData()).goals;
}
async function createSavingsGoal(input) {
	const data = await loadFinanceData();
	const newGoal = {
		id: randomUUID(),
		name: input.name,
		target: input.target,
		current: input.current ?? 0,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	data.goals = [...data.goals, newGoal];
	await persistFinanceData(data);
	return newGoal;
}
async function updateSavingsGoal(id, input) {
	const data = await loadFinanceData();
	data.goals = data.goals.map((goal) => goal.id === id ? {
		...goal,
		...input
	} : goal);
	await persistFinanceData(data);
}
async function deleteSavingsGoal(id) {
	const data = await loadFinanceData();
	data.goals = data.goals.filter((goal) => goal.id !== id);
	await persistFinanceData(data);
}
async function getBills() {
	return (await loadFinanceData()).bills;
}
async function createBill(input) {
	const data = await loadFinanceData();
	const newBill = {
		id: randomUUID(),
		name: input.name,
		amount: input.amount,
		dueDate: input.dueDate,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	data.bills = [...data.bills, newBill];
	await persistFinanceData(data);
	return newBill;
}
async function updateBill(id, input) {
	const data = await loadFinanceData();
	data.bills = data.bills.map((bill) => bill.id === id ? {
		...bill,
		...input
	} : bill);
	await persistFinanceData(data);
}
async function deleteBill(id) {
	const data = await loadFinanceData();
	data.bills = data.bills.filter((bill) => bill.id !== id);
	await persistFinanceData(data);
}
async function getWishlist() {
	return (await loadFinanceData()).wishlist;
}
async function createWishlistItem(input) {
	const data = await loadFinanceData();
	const newItem = {
		id: randomUUID(),
		name: input.name,
		price: input.price,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	data.wishlist = [...data.wishlist, newItem];
	await persistFinanceData(data);
	return newItem;
}
async function updateWishlistItem(id, input) {
	const data = await loadFinanceData();
	data.wishlist = data.wishlist.map((item) => item.id === id ? {
		...item,
		...input
	} : item);
	await persistFinanceData(data);
}
async function deleteWishlistItem(id) {
	const data = await loadFinanceData();
	data.wishlist = data.wishlist.filter((item) => item.id !== id);
	await persistFinanceData(data);
}
async function getAssets() {
	return (await loadFinanceData()).assets;
}
async function createAsset(input) {
	const data = await loadFinanceData();
	const newAsset = {
		id: randomUUID(),
		name: input.name,
		value: input.value,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	data.assets = [...data.assets, newAsset];
	await persistFinanceData(data);
	return newAsset;
}
async function updateAsset(id, input) {
	const data = await loadFinanceData();
	data.assets = data.assets.map((asset) => asset.id === id ? {
		...asset,
		...input
	} : asset);
	await persistFinanceData(data);
}
async function deleteAsset(id) {
	const data = await loadFinanceData();
	data.assets = data.assets.filter((asset) => asset.id !== id);
	await persistFinanceData(data);
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
	ipcMain.handle("finance:accounts:get", async () => {
		return getAccounts();
	});
	ipcMain.handle("finance:accounts:create", async (_event, input) => {
		return createAccount(input);
	});
	ipcMain.handle("finance:accounts:update", async (_event, id, input) => {
		await updateAccount(id, input);
		return true;
	});
	ipcMain.handle("finance:accounts:delete", async (_event, id) => {
		await deleteAccount(id);
		return true;
	});
	ipcMain.handle("finance:budgets:get", async () => {
		return getBudgets();
	});
	ipcMain.handle("finance:budgets:create", async (_event, input) => {
		return createBudget(input);
	});
	ipcMain.handle("finance:budgets:update", async (_event, id, input) => {
		await updateBudget(id, input);
		return true;
	});
	ipcMain.handle("finance:budgets:delete", async (_event, id) => {
		await deleteBudget(id);
		return true;
	});
	ipcMain.handle("finance:goals:get", async () => {
		return getSavingsGoals();
	});
	ipcMain.handle("finance:goals:create", async (_event, input) => {
		return createSavingsGoal(input);
	});
	ipcMain.handle("finance:goals:update", async (_event, id, input) => {
		await updateSavingsGoal(id, input);
		return true;
	});
	ipcMain.handle("finance:goals:delete", async (_event, id) => {
		await deleteSavingsGoal(id);
		return true;
	});
	ipcMain.handle("finance:bills:get", async () => {
		return getBills();
	});
	ipcMain.handle("finance:bills:create", async (_event, input) => {
		return createBill(input);
	});
	ipcMain.handle("finance:bills:update", async (_event, id, input) => {
		await updateBill(id, input);
		return true;
	});
	ipcMain.handle("finance:bills:delete", async (_event, id) => {
		await deleteBill(id);
		return true;
	});
	ipcMain.handle("finance:wishlist:get", async () => {
		return getWishlist();
	});
	ipcMain.handle("finance:wishlist:create", async (_event, input) => {
		return createWishlistItem(input);
	});
	ipcMain.handle("finance:wishlist:update", async (_event, id, input) => {
		await updateWishlistItem(id, input);
		return true;
	});
	ipcMain.handle("finance:wishlist:delete", async (_event, id) => {
		await deleteWishlistItem(id);
		return true;
	});
	ipcMain.handle("finance:assets:get", async () => {
		return getAssets();
	});
	ipcMain.handle("finance:assets:create", async (_event, input) => {
		return createAsset(input);
	});
	ipcMain.handle("finance:assets:update", async (_event, id, input) => {
		await updateAsset(id, input);
		return true;
	});
	ipcMain.handle("finance:assets:delete", async (_event, id) => {
		await deleteAsset(id);
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
//#region electron/services/routineService.ts
var ROUTINES_FILE = "routines.json";
var DEFAULT_ROUTINES = [];
async function getRoutineActivities() {
	return readJsonFile(ROUTINES_FILE, DEFAULT_ROUTINES);
}
async function createRoutineActivity(input) {
	const activities = await getRoutineActivities();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const newActivity = {
		id: randomUUID(),
		title: input.title,
		description: input.description ?? "",
		category: input.category,
		day: input.day,
		startTime: input.startTime,
		endTime: input.endTime ?? "",
		priority: input.priority,
		checked: false,
		notes: input.notes ?? "",
		createdAt: now,
		updatedAt: now
	};
	await writeJsonFile(ROUTINES_FILE, [...activities, newActivity]);
	return newActivity;
}
async function updateRoutineActivity(id, input) {
	await writeJsonFile(ROUTINES_FILE, (await getRoutineActivities()).map((activity) => {
		if (activity.id !== id) return activity;
		return {
			...activity,
			...input,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	}));
}
async function deleteRoutineActivity(id) {
	await writeJsonFile(ROUTINES_FILE, (await getRoutineActivities()).filter((activity) => activity.id !== id));
}
//#endregion
//#region electron/ipc/routineHandlers.ts
function registerRoutineHandlers() {
	ipcMain.handle("routine:get", async () => {
		return getRoutineActivities();
	});
	ipcMain.handle("routine:create", async (_event, input) => {
		return createRoutineActivity(input);
	});
	ipcMain.handle("routine:update", async (_event, id, input) => {
		await updateRoutineActivity(id, input);
		return true;
	});
	ipcMain.handle("routine:delete", async (_event, id) => {
		await deleteRoutineActivity(id);
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
	registerRoutineHandlers();
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
