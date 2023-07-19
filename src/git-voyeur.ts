// git-voyeur module main file
import { CliOptions } from "./git-voyeur-cli";
import gitFactory, { DefaultLogFields, ListLogLine } from "simple-git";
import { notify } from "node-notifier";
import * as path from "path";
import { debug as debugFactory } from "debug";

const debug = debugFactory("git-voyeur");

type Optional<T> = T | undefined;
type Nullable<T> = T | null;
type GitLog = DefaultLogFields & ListLogLine;

async function sendNotification(
    repoName: string,
    mostRecent: Nullable<GitLog>
) {
    if (!mostRecent) {
        return;
    }
    return new Promise<void>((resolve, reject) => {
        notify({
            title: `Update to ${ repoName }`,
            icon: "icon.png",
            message: `${ mostRecent.author_name } committed:\n${ mostRecent.message }`
        }, (err, response, meta) => {
            if (err) {
                console.error(`Unable to send notification: ${ err }`);
            }
            resolve();
        });
    });
}

export async function watch(opts: CliOptions) {
    let lastHash = undefined as Optional<string>;
    const
        repoPath = path.resolve(opts.repo),
        repoName = path.basename(repoPath);
    console.log(`watching ${ repoName } for changes, press Ctrl-C to stop`);
    // noinspection InfiniteLoopJS
    while (true) {
        try {
            const git = gitFactory(opts.repo);
            await git.fetch();
            const mostRecentLog = await git.log({
                maxCount: 1
            });
            const
                mostRecent = mostRecentLog.latest,
                latestHash = mostRecent?.hash || undefined;
            debug({
                latestHash,
                lastHash
            });
            if (latestHash !== lastHash) {
                if (false && lastHash === undefined) {
                    console.log(`watching as of ${ latestHash }: ${ mostRecent?.author_name }: ${ mostRecent?.message }`);
                } else {
                    await sendNotification(repoName, mostRecent);
                }
            }
            lastHash = latestHash;
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
