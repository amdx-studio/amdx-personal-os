import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import { fileURLToPath as r } from "node:url";
import i from "node:path";
import a from "node:fs/promises";
import { randomUUID as o } from "node:crypto";
//#region electron/services/jsonStore.ts
function s() {
	return i.join(t.getPath("userData"), "data");
}
async function c() {
	let e = s();
	await a.mkdir(e, { recursive: !0 });
}
function l(e) {
	return i.join(s(), e);
}
async function u(e, t) {
	await c();
	let n = l(e);
	try {
		let e = await a.readFile(n, "utf-8");
		return JSON.parse(e);
	} catch (n) {
		if (n.code === "ENOENT") return await d(e, t), t;
		throw Error(`Gagal membaca ${e}: ${n.message}`);
	}
}
async function d(e, t) {
	await c();
	let n = l(e), r = `${n}.tmp`, i = JSON.stringify(t, null, 2);
	await a.writeFile(r, i, "utf-8"), await a.rename(r, n);
}
//#endregion
//#region src/types/settings.ts
var ee = {
	theme: "system",
	language: "id",
	hasCompletedOnboarding: !1
}, f = "settings.json";
async function p() {
	return u(f, ee);
}
async function m(e) {
	await d(f, e);
}
//#endregion
//#region electron/ipc/settingsHandlers.ts
function te() {
	n.handle("settings:get", async () => p()), n.handle("settings:save", async (e, t) => (await m(t), !0));
}
//#endregion
//#region electron/services/tasksService.ts
var h = "tasks.json", g = [];
async function _() {
	return u(h, g);
}
async function v(e) {
	let t = await _(), n = {
		id: o(),
		title: e.title,
		description: e.description ?? "",
		category: e.category,
		deadline: e.deadline ?? null,
		status: e.status ?? "belum_dimulai",
		priority: e.priority ?? "medium",
		progress: e.progress ?? 0,
		notes: e.notes ?? "",
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		completedAt: null,
		archived: !1,
		kuliahDetails: e.kuliahDetails,
		jokiDetails: e.jokiDetails,
		klienDetails: e.klienDetails
	};
	return await d(h, [...t, n]), n;
}
async function y(e) {
	let t = await _(), n = t.findIndex((t) => t.id === e.id);
	if (n === -1) throw Error(`Task ${e.id} tidak ditemukan`);
	let r = t[n], i = {
		...r,
		...e
	};
	e.status && e.status !== r.status && (e.status === "selesai" ? (i.completedAt = (/* @__PURE__ */ new Date()).toISOString(), i.progress = 100) : r.status === "selesai" && (i.completedAt = null));
	let a = [...t];
	return a[n] = i, await d(h, a), i;
}
async function b(e) {
	await d(h, (await _()).filter((t) => t.id !== e));
}
async function ne(e) {
	let t = await _(), n = t.find((t) => t.id === e);
	if (!n) throw Error(`Task ${e} tidak ditemukan`);
	let r = {
		...n,
		id: o(),
		title: `${n.title} (Copy)`,
		status: "belum_dimulai",
		progress: 0,
		completedAt: null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		archived: !1
	};
	return await d(h, [...t, r]), r;
}
async function x(e) {
	return y({
		id: e,
		status: "selesai",
		progress: 100
	});
}
async function re(e, t) {
	return y({
		id: e,
		deadline: t
	});
}
async function S(e, t = !0) {
	return y({
		id: e,
		archived: t
	});
}
//#endregion
//#region electron/ipc/tasksHandlers.ts
function C() {
	n.handle("tasks:get", async () => _()), n.handle("tasks:create", async (e, t) => v(t)), n.handle("tasks:update", async (e, t) => y(t)), n.handle("tasks:delete", async (e, t) => (await b(t), !0)), n.handle("tasks:duplicate", async (e, t) => ne(t)), n.handle("tasks:markDone", async (e, t) => x(t)), n.handle("tasks:extendDeadline", async (e, t, n) => re(t, n)), n.handle("tasks:archive", async (e, t, n) => S(t, n));
}
//#endregion
//#region electron/services/notesService.ts
var w = "notes.json", ie = [];
async function T() {
	return u(w, ie);
}
async function E(e) {
	let t = await T(), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
		id: o(),
		title: e.title,
		content: e.content,
		createdAt: n,
		updatedAt: n
	};
	return await d(w, [...t, r]), r;
}
async function D(e, t) {
	await d(w, (await T()).map((n) => n.id === e ? {
		...n,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	} : n));
}
async function O(e) {
	await d(w, (await T()).filter((t) => t.id !== e));
}
//#endregion
//#region electron/ipc/notesHandlers.ts
function k() {
	n.handle("notes:get", async () => T()), n.handle("notes:create", async (e, t) => E(t)), n.handle("notes:update", async (e, t, n) => (await D(t, n), !0)), n.handle("notes:delete", async (e, t) => (await O(t), !0));
}
//#endregion
//#region electron/services/financeService.ts
var A = "finance.json", j = [];
async function M() {
	return u(A, j);
}
async function N(e) {
	let t = await M(), n = {
		id: o(),
		type: e.type,
		amount: e.amount,
		category: e.category,
		date: e.date,
		description: e.description ?? "",
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return await d(A, [...t, n]), n;
}
async function P(e, t) {
	await d(A, (await M()).map((n) => n.id === e ? {
		...n,
		...t
	} : n));
}
async function F(e) {
	await d(A, (await M()).filter((t) => t.id !== e));
}
//#endregion
//#region electron/ipc/financeHandlers.ts
function I() {
	n.handle("finance:get", async () => M()), n.handle("finance:create", async (e, t) => N(t)), n.handle("finance:update", async (e, t, n) => (await P(t, n), !0)), n.handle("finance:delete", async (e, t) => (await F(t), !0));
}
//#endregion
//#region electron/services/goalsService.ts
var L = "goals.json", R = [];
async function z() {
	return u(L, R);
}
async function B(e) {
	let t = await z(), n = {
		id: o(),
		title: e.title,
		targetValue: e.targetValue,
		currentValue: 0,
		unit: e.unit,
		deadline: e.deadline ?? null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return await d(L, [...t, n]), n;
}
async function ae(e, t) {
	await d(L, (await z()).map((n) => n.id === e ? {
		...n,
		...t
	} : n));
}
async function V(e) {
	await d(L, (await z()).filter((t) => t.id !== e));
}
//#endregion
//#region electron/ipc/goalsHandlers.ts
function H() {
	n.handle("goals:get", async () => z()), n.handle("goals:create", async (e, t) => B(t)), n.handle("goals:update", async (e, t, n) => (await ae(t, n), !0)), n.handle("goals:delete", async (e, t) => (await V(t), !0));
}
//#endregion
//#region electron/services/routineService.ts
var U = "routines.json", W = [];
async function G() {
	return u(U, W);
}
async function K(e) {
	let t = await G(), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
		id: o(),
		title: e.title,
		description: e.description ?? "",
		category: e.category,
		day: e.day,
		startTime: e.startTime,
		endTime: e.endTime ?? "",
		priority: e.priority,
		checked: !1,
		notes: e.notes ?? "",
		createdAt: n,
		updatedAt: n
	};
	return await d(U, [...t, r]), r;
}
async function q(e, t) {
	await d(U, (await G()).map((n) => n.id === e ? {
		...n,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	} : n));
}
async function J(e) {
	await d(U, (await G()).filter((t) => t.id !== e));
}
//#endregion
//#region electron/ipc/routineHandlers.ts
function oe() {
	n.handle("routine:get", async () => G()), n.handle("routine:create", async (e, t) => K(t)), n.handle("routine:update", async (e, t, n) => (await q(t, n), !0)), n.handle("routine:delete", async (e, t) => (await J(t), !0));
}
//#endregion
//#region electron/ipc/index.ts
function se() {
	te(), C(), k(), I(), H(), oe();
}
//#endregion
//#region electron/main.ts
var Y = i.dirname(r(import.meta.url));
process.env.APP_ROOT = i.join(Y, "..");
var X = process.env.VITE_DEV_SERVER_URL, ce = i.join(process.env.APP_ROOT, "dist-electron"), Z = i.join(process.env.APP_ROOT, "dist"), Q = null;
function $() {
	Q = new e({
		width: 1280,
		height: 800,
		minWidth: 1024,
		minHeight: 640,
		title: "AMDX Personal OS",
		webPreferences: {
			preload: i.join(Y, "preload.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), X ? (Q.loadURL(X), Q.webContents.openDevTools()) : Q.loadFile(i.join(Z, "index.html")), Q.on("closed", () => {
		Q = null;
	});
}
t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
}), t.on("activate", () => {
	e.getAllWindows().length === 0 && $();
}), n.handle("app:get-version", () => t.getVersion()), se(), t.whenReady().then($);
//#endregion
export { ce as MAIN_DIST, Z as RENDERER_DIST, X as VITE_DEV_SERVER_URL };
