# FinCoach — Website Frontend

Premium, mobile-responsive frontend for [FinCoach Bangladesh](https://fincoach.com.bd/) — an online platform to compare, check eligibility and apply for loans, credit cards and SME finance from banks and FIs in Bangladesh.

Built with **HTML5, CSS, JavaScript** and **Tailwind CSS (CDN)**. No build step and no backend.

## Pages

| Page | File | Highlights |
|---|---|---|
| Home | `index.html` | Hero with dashboard mockup, partner marquee, products, EMI calculator, steps, FAQ, news, contact form |
| About Us | `about.html` | Vision & mission, services, "how we offer", values, video modal |
| Contact Us | `contact.html` | Contact cards, topic form, office hours, Google Map, fraud notice, FAQ |
| Track Application | `track.html` | Search by Application ID / mobile, progress stepper, activity timeline |
| Login / Register | `login.html` | Sliding login/register panel, password strength, OTP (3-minute resend), forgot password |

## Run locally

```bash
node server.js
```

Then open <http://localhost:5500>. Any static server works too (e.g. Laragon/Apache at `localhost/Fincoach`).

## Project structure

```
index.html  about.html  contact.html  track.html  login.html
assets/
  css/style.css      # brand tokens, components, mobile layer
  js/main.js         # menus, sliders, calculator, tracking & auth UI
  img/               # logo + partner logos
server.js            # tiny static server for local preview
```

## Notes for developers

- **Front-end only:** forms (contact, login, register, OTP, tracking) use demo behaviour. Connect them to your backend APIs.
- **Demo tracking IDs:** `FC-2026-08814` (in bank review) and `FC-2026-07120` (disbursed).
- **Shared header/footer** are repeated in each HTML file — update all pages when changing navigation.
- **Tailwind** is loaded from the Play CDN for development; compile it for production.
