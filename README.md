# Semester Project: INFT2508 Cross-platform Application Development for Mobile Devices
## Info
Presented by: **Demetrio Battaglia**\
Student ID: **584801**\
Date: **04.12.2022**
*Please note that this document is best visualised in its HTML* (exported) *format, although it is also provided in Markdown* (original) *and PDF* (worst).

## Product Description & Features
This app follows the project presented by the professor of an e-commerce platform where you are presented with products in a front page, which you can expand to see in detail.

An example is provided with the **Let's Deal** app, which is used here as inspiration.

**Features include**:

* a front page with products presented in a grid with elements of different sizes (filter-able)
* a details page for each product
* a map with all the geolocated products (filter-able)
* the ability to add a product to personal favourites
* the ability to change app language and appearance

### Landing page

<p align="center">
  <img src="framed_screenshots/LandingPage-Light.png" width="49%" />
  <img src="framed_screenshots/LandingPage-Dark.png" width="49%" />

  **Figure 1.** Landing page in both light and dark mode
</p>

As instructed, cards in landing page describing products can be presented in multiple forms:
 
 * **Big**: This is the biggest card, the first one you can see in the screenshot
 * **Twins**: This is the smallest card, it fits along with another one on the same row and presents the minimum information it can.
 * **Small**: This is a medium card, which you cannot see in the first screenshot, because the cards are presented cyclically (more on this later)

The cycling of cards works like this: **one** big card, **four** twin cards and **two** small cards. Then a counter is resetted and the cycle starts again.

However, when filtering by search terms with the search bar above, only **small** cards are presented, whereas when filtering by category, the default cycle is used:

<p align="center">
  <img src="framed_screenshots/SearchExample-Superdeal-Light.png" width="49%" />
  <img src="framed_screenshots/SearchExample-CategoryWellbeing-Light.png" width="49%" />

  **Figure 2.** (a) Search by words. (b) Filter by category
</p>

#### Filtering by category
When pressing the hamburger button, a new view is presented with a list of categories to choose from. Multiple choice is allowed, in **figure 2a** all categories are selected, in **figure 2b** only **Wellbeing** is selected. The corresponding selections are shown in **figure 3**.

<p align="center">
  <img src="framed_screenshots/ChooseCategory-All-Light.png" width="49%" />
  <img src="framed_screenshots/ChooseCategory-Wellbeing-Light.png" width="49%" />

  **Figure 3.** (a) All categories visible. (b) Filter by *Wellbeing*.
</p>

Selecting no categories is also possible, and it's the same as selecting all of them, or rather "not filtering by category".

**Please note** that we can add any number of categories by simply mentioning them in the products objects and localising them in the locale files (e.g. `home.categories.food`). Here, for simplicity, we only have two.

### Map view
This was an optional feature, but a rather interesting one, especially for the use of markers in the map. Furthermore, this feature allows one to understand what's behind **permissions** (geolocation) and the difference between using **MapKit** and **Google Maps** (an API key is needed for GMaps).

An example of a selected product in the map is provided below, in both light and dark mode.

<p align="center">
  <img src="framed_screenshots/MapPage-Light.png" width="49%" />
  <img src="framed_screenshots/MapPage-Dark.png" width="49%" />

  **Figure 4.** Map view of all the products in the database
</p>

Pressing on the callout of a marker will lead to the product page, described in the next section.

Filtering by words or category works on here too.

### Product details
One of the major features requested for this app is to show products in detail in a page dedicated to each one of them. Below are two screenshots of the details of a product, for light and dark mode.

<p align="center">
  <img src="framed_screenshots/ProductDetails-Light.png" width="49%" />
  <img src="framed_screenshots/ProductDetails-Dark.png" width="49%" />

  **Figure 5.** Product details with long description, price, contact information, location (pressing on **Map** will focus the product on the map) and the option to buy.
</p>

Pressing on the telephone or website buttons will respectively initiate a call or open the system browser to the linked website.

Pressing the **Buy** button will do something different based on the app settings and system capabilities: on iOS, Touch ID and Face ID offer a reliable way of protecting data, but are mutually exclusive. If the device supports it, one can choose to "protect" purchases with either of those biometrics in the settings, like shown in **figure 6**.

<p align="center">
  <img src="framed_screenshots/BuyAuth-Light.png" width="19%" />
  <img src="framed_screenshots/BuyAuth-Fail-Light.png" width="19%" />
  <img src="framed_screenshots/BuyAuth-Success-Light.png" width="19%" />
  <img src="framed_screenshots/ChooseAuth-None-Light.png" width="19%" />
  <img src="framed_screenshots/ChooseAuth-Invalid-Light.png" width="19%" />

  **Figure 6.** From left to right, Face ID request, Face ID fail, Face ID success, Settings selection (None / Touch ID / Face ID), Settings selection failed (unsupported technology selected).
</p>

### My Favourites
One of the core features is also to be able to mark products as **favourites**. Doing so will add them to a view called "My Favourites". In each product card you can see an heart overlaying the product image, pressing it will add it to favourites.

<p align="center">
  <img src="framed_screenshots/MyFavourites-Light.png" width="49%" />
  <img src="framed_screenshots/MyFavourites-Dark.png" width="49%" />

  **Figure 7.** My Favourites page (localised in Norwegian Bokmål)
</p>

Pressing each card (here presented always as **small** type) will open the product details page just described.

### Settings
Finally, the settings view will allow us to set **Light / Dark Mode**, **Language**, and **Authentication** method for purchases (described in **Product details** section).

<p align="center">
  <img src="framed_screenshots/Settings-Light.png" width="19%" />
  <img src="framed_screenshots/Settings-Dark.png" width="19%" />
  <img src="framed_screenshots/ChooseLanguage-Dark.png" width="19%" />
  <img src="framed_screenshots/ChooseLanguage-Italian-Light.png" width="19%" />
  <img src="framed_screenshots/Settings-Italian-Dark.png" width="19%" />

  **Figure 8.** From left to right: Norwegian Light Mode Settings; Norwegian Dark Mode Settings; Norwegian Language Selection (Dark); Italian Language Selection (Light); Italian Dark Mode Settings. 
</p>

## Design decisions and main components
```
.
├── components/
│   ├── FilterBar.js
│   ├── ProductCard.js
│   ├── Tag.js
│   └── Title.js
├── data/
│   ├── public/img/
│   └── db.json
├── localisation/
│   ├── en-GB.json
│   ├── it-IT.json
│   ├── localisation.js
│   └── nb-NO.json
├── views/
│   ├── Home.js
│   ├── MapView.js
│   ├── MyFavourites.js
│   ├── ProductDetails.js
│   ├── Settings.js
│   └── SettingsDetailed.js
├── App.js
├── AppState.js
├── Globals.js
├── index.js
└── palette.js
```

The code can be divided in **General Components**, **Views** and **Views Sub-Components**.

The **General Components** are located in the `components/`: those are the components that are mostly re-used in multiple different views or components (e.g. `Title` is used in `Settings` and `MyFavourites`, `Tag` is used in `ProductCard` and `ProductDetails`).

The **Views** are components that are used as different pages in the app:

  * **Home**: Here we have a stack navigator with three sub-views
    * **Landing page**
    * **ProductDetails**: shows when a card is clicked
    * **CategorySeection**: shows when clicking on the hamburger to filter by category
  * **MapView**: Stack navigator with two sub-views
    * **MapPage**: the map itself
    * **ProductDetails**: shows when a callout is clicked
  * **MyFavourites**: Stack navigator with two sub-views
    * **Favourites list**
    * **ProductDetails**: shows when a product is clicked
  * **Settings**: a stack view with three sub-views
    * **Settings list**
    * **Language selection**
    * **Authentication selection**

The **Views Sub-Components** are components that are made re-usable and sometimes exported when they are mostly or exclusively used within the view itself (e.g. `ImageGallery` in `ProductDetails`).

These sub-components have been made not to pollute too much the main reusable components, that mostly constitute important parts of the app.

Additionally, I have made use of `createContext` to create a global state within the app that stores the current settings and allows us to update the app appearance and language without closing and reloading the app.

As for what concerns UI Design, I've taken mostly inspiration from the Let's Deal app layout, and adapted it to the project requisites.

I have used cards instead of a simple grid of products because it helps picturing what the assignment asks for: different sizes.

The colour palette is mostly taken from Let's Deal.

## Launching the app
### Data server
The app requires a server to be running, so you'll have to start it with:

```bash
npm run mockapi
```

This will start a json-server on all interfaces (**0.0.0.0**) instead of **localhost**, because the Android Emulator will contact **10.0.2.2** to access the host machine. Whereas iOS Simulator will contact **localhost** because it shares the same virtual network as the host machine. This behaviour is accounted for in `Globals.js`. Default port is **3000**.

The server is already set up with some data about products and favourites. It also contains some images for the products taken from the Let's Deal website.

These images are property of the respective companies that ran the ads on the website.

### Metro bundler
```bash
npm start
```

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

Or, if you have multiple JDK in your system, you can use

```bash
npm run android-jdk11
```

As the AVD requires Java 11.

**Please note** that Android will require a Google Maps API key in the app configuration before running. You can edit the API key in `android/app/src/main/AndroidManifest.xml` at the line that looks like this:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="[ API KEY HERE ]" />
```

**Please also note** that iOS does not require an API key for MapKit.