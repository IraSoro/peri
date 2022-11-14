import { Storage, Drivers } from "@ionic/storage";

var storage = false;

export const createStore = (name = "PeriodDB") => {

    storage = new Storage({
        
        name,
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    });

    storage.create();
}


export const set = (key, val) => {

    storage.set(key, val);
}

export const get = async key => {

    const val = await storage.get(key);
    return val;
}

export const remove = async key => {

    await storage.remove(key);
}

export const clear = async () => {

    await storage.clear();
}

export const setObject = async (key, id, val) => {

    const all = await storage.get(key);
    const objIndex = await all.findIndex(a => parseInt(a.id) === parseInt(id));

    all[objIndex] = val;
    set(key, all);
}

export const removeObject = async (key, id) => {

    const all = await storage.get(key);
    const objIndex = await all.findIndex(a => parseInt(a.id) === parseInt(id));

    all.splice(objIndex, 1);
    set(key, all);
}

export const getObject = async (key, id) => {

    const all = await storage.get(key);
    const obj = await all.filter(a => parseInt(a.id) === parseInt(id))[0];
    return obj;
}
