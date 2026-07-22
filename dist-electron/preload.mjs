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
	notes: {
		get: () => electron.ipcRenderer.invoke("notes:get"),
		create: (input) => electron.ipcRenderer.invoke("notes:create", input),
		update: (id, input) => electron.ipcRenderer.invoke("notes:update", id, input),
		delete: (id) => electron.ipcRenderer.invoke("notes:delete", id)
	},
	finance: {
		get: () => electron.ipcRenderer.invoke("finance:get"),
		create: (input) => electron.ipcRenderer.invoke("finance:create", input),
		update: (id, input) => electron.ipcRenderer.invoke("finance:update", id, input),
		delete: (id) => electron.ipcRenderer.invoke("finance:delete", id),
		accounts: {
			get: () => electron.ipcRenderer.invoke("finance:accounts:get"),
			create: (input) => electron.ipcRenderer.invoke("finance:accounts:create", input),
			update: (id, input) => electron.ipcRenderer.invoke("finance:accounts:update", id, input),
			delete: (id) => electron.ipcRenderer.invoke("finance:accounts:delete", id)
		},
		budgets: {
			get: () => electron.ipcRenderer.invoke("finance:budgets:get"),
			create: (input) => electron.ipcRenderer.invoke("finance:budgets:create", input),
			update: (id, input) => electron.ipcRenderer.invoke("finance:budgets:update", id, input),
			delete: (id) => electron.ipcRenderer.invoke("finance:budgets:delete", id)
		},
		goals: {
			get: () => electron.ipcRenderer.invoke("finance:goals:get"),
			create: (input) => electron.ipcRenderer.invoke("finance:goals:create", input),
			update: (id, input) => electron.ipcRenderer.invoke("finance:goals:update", id, input),
			delete: (id) => electron.ipcRenderer.invoke("finance:goals:delete", id)
		},
		bills: {
			get: () => electron.ipcRenderer.invoke("finance:bills:get"),
			create: (input) => electron.ipcRenderer.invoke("finance:bills:create", input),
			update: (id, input) => electron.ipcRenderer.invoke("finance:bills:update", id, input),
			delete: (id) => electron.ipcRenderer.invoke("finance:bills:delete", id)
		},
		wishlist: {
			get: () => electron.ipcRenderer.invoke("finance:wishlist:get"),
			create: (input) => electron.ipcRenderer.invoke("finance:wishlist:create", input),
			update: (id, input) => electron.ipcRenderer.invoke("finance:wishlist:update", id, input),
			delete: (id) => electron.ipcRenderer.invoke("finance:wishlist:delete", id)
		},
		assets: {
			get: () => electron.ipcRenderer.invoke("finance:assets:get"),
			create: (input) => electron.ipcRenderer.invoke("finance:assets:create", input),
			update: (id, input) => electron.ipcRenderer.invoke("finance:assets:update", id, input),
			delete: (id) => electron.ipcRenderer.invoke("finance:assets:delete", id)
		}
	},
	goals: {
		get: () => electron.ipcRenderer.invoke("goals:get"),
		create: (input) => electron.ipcRenderer.invoke("goals:create", input),
		update: (id, input) => electron.ipcRenderer.invoke("goals:update", id, input),
		delete: (id) => electron.ipcRenderer.invoke("goals:delete", id)
	}
});
//#endregion
