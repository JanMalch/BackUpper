# BackUpper

_Simple and portable backup tool, that creates backups by simply copying._

## Example Config

```toml
[[backup]]
keep = 5
dest = "F:/Backups/Daily"
frequency = "daily"
sources = [
    "C:\\Users\\User\\Documents\\Important",
    "C:\\Users\\User\\Documents\\Very Important",
]

[[backup]]
keep = 3
dest = "F:/Backups/Monthly"
frequency = "monthly"
sources = [
    "C:\\Users\\User\\Pictures",
]
```

## Development

```sh
deno run --allow-read --allow-write main.ts
```

```sh
deno compile --allow-read --allow-write main.ts
```
