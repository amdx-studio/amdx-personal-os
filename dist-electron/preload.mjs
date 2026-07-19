let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electronAPI", {
	app: { getVersion: () => electron.ipcRenderer.invoke("app:get-version") },
	settings: {
		get: () => electron.ipcRenderer.invoke("settings:get"),
		save: (settings) => electron.ipcRenderer.invoke("settings:save", settings)
	},
	tasks: {
		get: () => electron.ipcRenderer.invoke("tasks:get"),
		create: (input) => electron.ipcRenderer.invoke("tasks:create", input),
		update: (input) => electron.ipcRenderer.invoke("tasks:update", input),
		delete: (id) => electron.ipcRenderer.invoke("tasks:delete", id),
		duplicate: (id) => electron.ipcRenderer.invoke("tasks:duplicate", id),
		markDone: (id) => electron.ipcRenderer.invoke("tasks:markDone", id),
		extendDeadline: (id, newDeadline) => electron.ipcRenderer.invoke("tasks:extendDeadline", id, newDeadline),
		archive: (id, archived) => electron.ipcRenderer.invoke("tasks:archive", id, archived)
	},
	habits: {
		get: () => electron.ipcRenderer.invoke("habits:get"),
		create: (input) => electron.ipcRenderer.invoke("habits:create", input),
		toggleToday: (id) => electron.ipcRenderer.invoke("habits:toggleToday", id),
		delete: (id) => electron.ipcRenderer.invoke("habits:delete", id)
	},
	notes: {
		get: () => electron.ipcRenderer.invoke("notes:get"),
		create: (input) => electron.ipcRenderer.invoke("notes:create", input),
		update: (id, input) => electron.ipcRenderer.invoke("notes:update", id, input),
		delete: (id) => electron.ipcRenderer.invoke("notes:delete", id)
	},
	calendar: {
		get: () => electron.ipcRenderer.invoke("calendar:get"),
		create: (input) => electron.ipcRenderer.invoke("calendar:create", input),
		update: (id, input) => electron.ipcRenderer.invoke("calendar:update", id, input),
		delete: (id) => electron.ipcRenderer.invoke("calendar:delete", id)
	},
	finance: {
		get: () => electron.ipcRenderer.invoke("finance:get"),
		create: (input) => electron.ipcRenderer.invoke("finance:create", input),
		update: (id, input) => electron.ipcRenderer.invoke("finance:update", id, input),
		delete: (id) => electron.ipcRenderer.invoke("finance:delete", id)
	},
	goals: {
		get: () => electron.ipcRenderer.invoke("goals:get"),
		create: (input) => electron.ipcRenderer.invoke("goals:create", input),
		update: (id, input) => electron.ipcRenderer.invoke("goals:update", id, input),
		delete: (id) => electron.ipcRenderer.invoke("goals:delete", id)
	},
	prayer: {
		getSettings: () => electron.ipcRenderer.invoke("prayer:getSettings"),
		saveSettings: (settings) => electron.ipcRenderer.invoke("prayer:saveSettings", settings)
	}
});
//#endregion
