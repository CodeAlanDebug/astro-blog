# XCMG digital business card

Printable and phone assets for the card at
[alan.zheng.dev/xcmg/](https://alan.zheng.dev/xcmg/). This folder is **not**
published to the website. It lives in the repo only.

## Links

| What                 | URL                                        |
| -------------------- | ------------------------------------------ |
| Card                 | https://alan.zheng.dev/xcmg/               |
| QR target            | https://xcmg.alan.one → 302 → the card     |
| Full-screen QR page  | https://alan.zheng.dev/xcmg/qr/            |
| Contact file (vCard) | https://alan.zheng.dev/xcmg/alan-zheng.vcf |

## Files

| File                                                                                                             | Use                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`qr-code/xcmg-alan-one.svg`](qr-code/xcmg-alan-one.svg)                                                         | Vector QR for print, any size. Encodes `https://xcmg.alan.one`. Print at least 2 cm wide; keep the white border. |
| [`qr-code/xcmg-alan-one-2000px.png`](qr-code/xcmg-alan-one-2000px.png)                                           | Same QR as a 2000×2000 PNG.                                                                                      |
| [`lockscreen/lockscreen-iphone-14-plus-1284x2778.png`](lockscreen/lockscreen-iphone-14-plus-1284x2778.png)       | Lock Screen wallpaper, iPhone 14 Plus.                                                                           |
| [`lockscreen/lockscreen-iphone-15-pro-max-1290x2796.png`](lockscreen/lockscreen-iphone-15-pro-max-1290x2796.png) | Lock Screen wallpaper, iPhone 15 Pro Max.                                                                        |
| [`lockscreen/lockscreen-iphone-18-pro-max-1320x2868.png`](lockscreen/lockscreen-iphone-18-pro-max-1320x2868.png) | Lock Screen wallpaper, iPhone 18 Pro Max.                                                                        |
| [`screenshots/`](screenshots/)                                                                                   | How the card, WeChat sheet and QR page look on iPhone.                                                           |

Every QR image here was decoded and checked to read `https://xcmg.alan.one`.

Assets the site itself serves live in [`public/xcmg/`](../../public/xcmg/):
the WeChat QR (`wechat-qr.jpg`, metadata removed, image unchanged) and the
Home Screen icons.

## Editing the card

All details (name, title, phone, WhatsApp, WeChat, email, location, brand
colours) are in [`src/data/xcmgCard.ts`](../../src/data/xcmgCard.ts). Change
that one file; the page, the vCard and the QR page all read from it.

| Path                               | What                                        |
| ---------------------------------- | ------------------------------------------- |
| `src/pages/xcmg/index.astro`       | Card page                                   |
| `src/pages/xcmg/qr/`               | Full-screen QR page and its Home Screen app |
| `src/pages/xcmg/alan-zheng.vcf.ts` | "Save contact" vCard                        |
| `src/components/XcmgLogo.astro`    | Official XCMG logo (from xcmgglobal.com)    |

If `qrUrl` in `xcmgCard.ts` ever changes, regenerate the QR images and
Lock Screen wallpapers in this folder: the printed and saved codes don't
update themselves. Pointing the `xcmg.alan.one` redirect somewhere else
does not need new QR codes.

## Cloudflare (alan.one zone)

- DNS: `xcmg`, proxied.
- Redirect rule: `http*://xcmg.alan.one/*` → `https://alan.zheng.dev/xcmg/`, 302.

History: PRs #137, #138, #139.
