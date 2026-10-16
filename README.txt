CRUMB DONUT SYSTEM - FRONTEND PROTOTYPE v0.9

HOW TO RUN
1. Extract the ZIP file.
2. Open index.html in a modern browser.
3. Sign in with one of the demo accounts below.
4. Admin account: username admin, password boss.
5. Customer account: username user, password 123.
6. Sign in as admin first to create catalog products and a selling session with today's stock.
7. Sign out, then sign in as user to browse availability and test reservations.

WHAT IS DEMONSTRATED
- Login page shown first; no customer/admin mode toggle buttons.
- Admin login opens the management workspace; customer login opens the customer storefront.
- User-defined catalog products and prices.
- Dated selling sessions with session-specific stock.
- Close a selling session without deleting its transactions; start a new session with fresh stock.
- Session picker and reports identify each session by date and open/closed status.
- Admin sales entry, session-specific transaction history, overview, reservations, and reports.
- Weekly revenue bar chart and an hourly line chart for the number of donuts sold today, aggregated across saved sessions.
- Customer menu displays the exact number of units available today for each product.
- Customer reservation submission and temporary stock holds.
- Unpaid reservations expire after 10 minutes in the open prototype and release their held stock.
- Admin can create reservations on behalf of customers, including optional contact details and a payment method. Admin-created reservations use the same stock validation and hold logic as customer reservations.
- Admin-created reservations remain pending until collected or cancelled; they do not expire automatically. Customer storefront reservations still expire after 10 minutes if unpaid in this demo.
- Admin can mark a reservation collected or reject/release it. The reservation list shows its source, creation date/time, contact when provided, and payment status.
- GCash is displayed as a payment option, but the checkout button is intentionally inactive.
- Prototype data is saved in the browser's localStorage.

LIMITATIONS
The demo credentials are hardcoded for presentation only and are not secure authentication. This is a frontend-only demonstration and does not use a backend or shared online database. Data saved in localStorage exists only in the current browser. Transactions recorded before v0.5 may not have exact timestamps; the charts estimate their time from the session date and saved time string. New transactions store exact timestamps. There is no real GCash integration and no money is transferred. A production version would need a Java/Spring Boot backend, shared PostgreSQL database, server-side authorization, and verified payment-provider integration.

Checkout names and numbering
- Every completed sale receives a globally increasing checkout number (Checkout #001, #002, #003...), across all selling sessions.
- Each checkout has a separate editable name. The default is Checkout 1, Checkout 2, etc. Renaming a checkout never changes or reuses its number.
- In Reports, use Edit name beneath a checkout number. Leave the name blank to restore its default.

Analytics charts in v0.9:
- The former Today revenue bar chart is replaced by a line chart counting donut units sold per hour for the current local day.
- The weekly revenue bar chart remains.
- Today's pie chart shows the share of product units sold today.
- Weekly pie chart shows the share of product units sold over the last seven calendar days, including today.
- A market mood panel appears above the charts. It compares units sold in the latest three-hour window with the preceding three-hour window: a clear rise shows Stonks, a clear fall shows Not Stonks, and smaller changes show Kalm. It uses the supplied Stonks and Not Stonks image URLs plus a small local Kalm illustration. Images are clickable and open in a new tab.
Charts are calculated from recorded transactions stored in this browser; they do not represent shared or server-side data.
