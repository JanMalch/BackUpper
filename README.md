# BackUpper <img src="/.idea/icon.png" width="90" height="90" align="right">

_Simple and portable backup tool, that creates backups by simply copying._

## Installation

1. Download [the latest release](https://github.com/JanMalch/BackUpper2/releases) for your operating system
2. Create a `backupper-config.toml` right next to the executable and configure it as seen below
3. If you like, add the executable to your autostart

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

## Credit

- Logo created with [IconKitchen](https://icon.kitchen/i/H4sIAAAAAAAAA02Py47CMAxF%2F8WzZVFGM5qhW4T4ANghhNzESSPcGvIAIdR%2FxwEhscnj2Nf3%2Bg4X5EIJ2jtYjMdtTwNB65ATzaDz29tJv%2BAj2kBjhhk4v%2BRwwpirJJFeYMlh4VoMRsYKYrjQwQWmwyD6kpI5jARTla%2BcI5PVEVKPVq4q6%2Fymx6dROpcQDZPCXKPYjyzrdwg1NsIS5yr4cs7Mmz%2Ftf6LvF1r8N40iHL2Oan9%2BJ3UexBaum%2B6U2yjB1sCS9LxSB%2FvpAcv9WCIMAQAA)
