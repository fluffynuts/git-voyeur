// git-voyeur module main file
import { CliOptions } from "./git-voyeur-cli";
import gitFactory, { DefaultLogFields, ListLogLine } from "simple-git";
import { notify } from "node-notifier";
import * as path from "path";
import { debug as debugFactory } from "debug";
import { fileExists } from "yafs";
import { emojify } from "node-emoji";

const debug = debugFactory("git-voyeur");

type Optional<T> = T | undefined;
type Nullable<T> = T | null;
type GitLog = DefaultLogFields & ListLogLine;

async function sendNotification(
    repoName: string,
    log: Nullable<GitLog>,
    tracking: string
) {
    if (!log) {
        return;
    }
    const icon = await findIcon();
    return new Promise<void>(resolve => {
        notify({
            title: `${ repoName } : (${tracking}) updated by ${log.author_name}`,
            icon,
            wait: true,
            message: emojify(log.message)
        }, (err) => {
            if (err) {
                console.error(`Unable to send notification: ${ err }`);
            }
            resolve();
        });
    });
}

const iconSearch = [
    path.resolve("./icon.png"),
    path.resolve(path.join(__dirname, "icon.png"))
];

async function findIcon(): Promise<Optional<string>> {
    for (const icon of iconSearch) {
        if (await fileExists(icon)) {
            debug(`found icon at '${ icon }'`);
            return icon;
        }
    }
    debug(`unable to find icon, searched:\n${ iconSearch.join("\n") }`);
    return undefined;
}

export async function watch(opts: CliOptions) {
    const
        repoPath = path.resolve(opts.repo),
        repoName = path.basename(repoPath);
    console.log(`watching ${ repoName } for changes, press Ctrl-C to stop`);
    // noinspection InfiniteLoopJS
    while (true) {
        try {
            const git = gitFactory(opts.repo);
            const fetchResult = await git.fetch();
            if (fetchResult.updated.length === 0) {
                await sleep(opts.interval * 1000);
                continue;
            }
            for (const update of fetchResult.updated) {
                const log = await git.log({
                    from: update.from,
                    to: update.to
                });
                if (!log.latest) {
                    continue;
                }
                debug(update);
                debug(`--- should notify of update ---`);
                await sendNotification(repoName, log.latest, update.tracking);
            }
            await sleep(opts.interval * 1000);
        } catch (e) {
            console.error(`Error: ${ e }`);
        }
    }
}

async function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
