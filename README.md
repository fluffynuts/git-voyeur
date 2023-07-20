git-voyeur
---

Be notified when a git repo has upstream changes

usage
---

inside a repository:
```
npx -y git-voyeur
```

anywhere else:
```
npx -y git-voyeur --repo /path/to/repo
```

default poll is 30s, change with `--interval`:
```
npx -y git-voyeur --repo /path/to/repo --interval 60
```


