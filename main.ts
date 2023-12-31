import { parse } from "https://deno.land/std@0.210.0/toml/mod.ts";
import { existsSync, ensureDirSync, copySync } from "https://deno.land/std@0.210.0/fs/mod.ts";
import { resolve, basename } from "https://deno.land/std@0.210.0/path/mod.ts";


interface Backup {
    readonly keep: number;
    readonly dest: string;
    readonly frequency: 'daily' | 'monthly';
    sources: string[];
}

interface Config {
    readonly backup: readonly Backup[];
}

function todaysDirName(frequency: Backup["frequency"]): string {   
    const today = new Date();
    if (frequency === "daily") {
        return today.toJSON().substring(0, 10);
    }
    if (frequency === "monthly") {
        return today.toJSON().substring(0, 7);
    }
    throw new Error(`Unknown frequency '${frequency}'.`)
}


const decoder = new TextDecoder("utf-8");
const configFile = "./backupper-config.toml"
const configFileData = Deno.readFileSync(configFile);
const config = parse(decoder.decode(configFileData)) as unknown as Config;

// Validate (and normalize) all first.
const seenDests = new Set<string>();

for (const backup of config.backup) {
    if (typeof backup.dest !== "string" || backup.dest.trim().length === 0) {
        console.error(`Invalid config: "dest" is missing or empty.`)
        Deno.exit(1)
    }
    if (seenDests.has(backup.dest)) {
        console.error(`Invalid config: "dest" of '${backup.dest}' is already used. Each "dest" must be different to properly count old backups.`)
        Deno.exit(1)
    }
    seenDests.add(backup.dest);

    if (!Number.isFinite(backup.keep) || backup.keep <= 0) {
        console.error(`Invalid config (${backup.dest}): "keep" must be a number greater than zero.`)
        Deno.exit(1)
    }
    if (backup.frequency !== 'daily' && backup.frequency !== 'monthly') {
        console.error(`Invalid config (${backup.dest}): "frequency" must be "daily" or "monthly".`)
        Deno.exit(1)
    }
    backup.sources = backup.sources
        .map(s => s.trim())
        .filter(s => s.length > 0)
    if (backup.sources.length === 0) {
        console.error(`Invalid config (${backup.dest}): "sources" does not have any valid values.`)
        Deno.exit(1)
    }
    const notExisting: string[] = []
    for (const src of backup.sources) {
        if (!existsSync(src)) {
            notExisting.push(src)
        }
    }
    if (notExisting.length > 0) {        
        console.error(`Invalid config (${backup.dest}): Some "sources" could not be found:\n${notExisting.join("\n")}`)
        Deno.exit(1)
    }
}

function findOldest(existingBackups: Deno.DirEntry[], backup: Backup): string[] {
    let validBirthtimes = true;
    const existingInfos = existingBackups.map(existing => {
        const path = resolve(backup.dest, existing.name)
        const info = Deno.statSync(path);
        if (info.birthtime == null) {
            validBirthtimes = false;
        }
        return { path, birthtime: info.birthtime }
    }).sort((a, b) => (a.birthtime?.getTime() ?? 0) - (b.birthtime?.getTime() ?? 0));
    if (validBirthtimes) {
        return existingInfos.slice(0, existingInfos.length - backup.keep).map(i => i.path);
    }
    console.warn(`\tFailed to read directory birthtime from OS. Falling back to names.`);
    const existingInfosByName = existingBackups
        .map(existing => existing.name)
        .sort()
        .map(existingName => resolve(backup.dest, existingName));
    return existingInfosByName.slice(0, existingInfosByName.length - backup.keep);
}

for (const backup of config.backup) {
    console.log(`Checking if backup to '${backup.dest}' has to run ...`);
    try {
        ensureDirSync(backup.dest);
        const todaysDest = resolve(backup.dest, todaysDirName(backup.frequency))
        if (existsSync(todaysDest)) {
            console.log(`\tBackup '${todaysDest}' already exists.\n`)
            continue;
        }
        console.log(`\tStarting backup to '${todaysDest}' with ${backup.sources.length} sources ...`);
        for (const src of backup.sources) {
            const destForSrc = resolve(todaysDest, basename(src))
            console.log(`\t\tCopying '${src}' to '${destForSrc}' ...`);
            // preserveTimestamps: true causes issues on Windows..?
            copySync(src, destForSrc, { preserveTimestamps: false });
        }
        console.log(`\tCopied all sources to '${todaysDest}'.\n`);

        console.log(`\tChecking if old backups in ${backup.dest} can be removed ...`);
        const existingBackups = Array.from(Deno.readDirSync(backup.dest))
        const isOverKeep = existingBackups.length > backup.keep;
        if (!isOverKeep) {
            console.log(`\tNo backups in ${backup.dest} have been removed.`);
        } else {
            const toDeleteList = findOldest(existingBackups, backup)
            for (const toDelete of toDeleteList) {
                console.log(`\t\tRemoving old backup '${toDelete}' ...`);
                Deno.removeSync(toDelete, { recursive: true });
            }
        }
    } catch (e) {
        console.warn(`\tError while running backup to '${backup.dest}'.`, e)
    }
    console.log(`\tBackup to '${backup.dest}' finished!\n`);
}
console.log(`All backups have finished. Bye!`);
