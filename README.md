# Level Generator

A Phaser 3 word puzzle level generator that creates crossword-style puzzles. Built with Vite for fast development and production builds.

## Features

- **Crossword-style puzzle generation**: Automatically places words in intersecting patterns
- **Interactive grid system**: 8x8 grid for word placement
- **Word shuffling**: Randomizes word placement for variety
- **Refresh functionality**: Generate new puzzles on demand
- **Responsive design**: Built with modern web technologies

### Technologies Used

- [Phaser 3.90.0](https://github.com/phaserjs/phaser) - Game framework
- [Vite 6.3.1](https://github.com/vitejs/vite) - Build tool and dev server

![screenshot](screenshot.png)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data (see "About log.js" below) |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |


## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to `http://localhost:8080`

The development server supports hot-reloading, so changes to the code will automatically refresh the browser.

## How It Works

The level generator creates word puzzle levels by:

1. **Word Processing**: Takes a list of words (currently: SEAT, EAT, TEA, SET, EAST)
2. **Grid Placement**: Uses an 8x8 grid system with 64px cell size
3. **Intersection Logic**: Finds optimal intersections between words
4. **Dynamic Generation**: Creates new puzzles each time the refresh button is clicked

## Project Structure

| Path                         | Description                                                |
|------------------------------|------------------------------------------------------------|
| `index.html`                 | Main HTML entry point                                     |
| `public/assets`              | Static assets (images, sounds, etc.)                      |
| `public/style.css`           | Global styles                                              |
| `src/main.js`                | Application entry point                                    |
| `src/game/main.js`           | Game configuration and initialization                      |
| `src/game/scenes/`           | Phaser game scenes                                         |
| `src/game/scenes/Game.js`    | Main game scene with level generation logic               |
| `src/game/scenes/Boot.js`    | Initial boot scene                                         |
| `src/game/scenes/Preloader.js` | Asset loading scene                                     |
| `src/game/scenes/MainMenu.js`| Main menu interface                                        |
| `src/game/scenes/GameOver.js`| Game over screen                                          | 

## Handling Assets

Vite supports loading assets via JavaScript module `import` statements.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from './assets/logo.png'
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload ()
{
    //  This is an example of an imported bundled image.
    //  Remember to import it at the top of this file
    this.load.image('logo', logoImg);

    //  This is an example of loading a static image
    //  from the public/assets folder:
    this.load.image('background', 'assets/bg.png');
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

## Customization

### Adding New Words

To add new words to the puzzle generator, modify the `words` array in `src/game/scenes/Game.js`:

```js
this.words = this.shuffleInPlace(['SEAT', 'EAT', 'TEA', 'SET', 'EAST', 'YOUR_NEW_WORD']);
```

### Adjusting Grid Size

The grid dimensions can be modified by changing these properties in the Game scene:

```js
this.rows = 8;      // Number of rows
this.cols = 8;      // Number of columns
this.gridSize = 64; // Size of each cell in pixels
```

### Build Configuration

Vite configuration files are located in the `vite/` directory:
- `config.dev.mjs` - Development configuration
- `config.prod.mjs` - Production configuration

See the [Vite documentation](https://vitejs.dev/) for advanced customization options.

## About log.js

If you inspect our node scripts you will see there is a file called `log.js`. This file makes a single silent API call to a domain called `gryzor.co`. This domain is owned by Phaser Studio Inc. The domain name is a homage to one of our favorite retro games.

We send the following 3 pieces of data to this API: The name of the template being used (vue, react, etc). If the build was 'dev' or 'prod' and finally the version of Phaser being used.

At no point is any personal data collected or sent. We don't know about your project files, device, browser or anything else. Feel free to inspect the `log.js` file to confirm this.

Why do we do this? Because being open source means we have no visible metrics about which of our templates are being used. We work hard to maintain a large and diverse set of templates for Phaser developers and this is our small anonymous way to determine if that work is actually paying off, or not. In short, it helps us ensure we're building the tools for you.

However, if you don't want to send any data, you can use these commands instead:

Dev:

```bash
npm run dev-nolog
```

Build:

```bash
npm run build-nolog
```

Or, to disable the log entirely, simply delete the file `log.js` and remove the call to it in the `scripts` section of `package.json`:

Before:

```json
"scripts": {
    "dev": "node log.js dev & dev-template-script",
    "build": "node log.js build & build-template-script"
},
```

After:

```json
"scripts": {
    "dev": "dev-template-script",
    "build": "build-template-script"
},
```

Either of these will stop `log.js` from running. If you do decide to do this, please could you at least join our Discord and tell us which template you're using! Or send us a quick email. Either will be super-helpful, thank you.

## Contributing

Feel free to submit issues and pull requests to improve the level generator.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Phaser 3 Documentation](https://newdocs.phaser.io)
- [Vite Documentation](https://vitejs.dev)
- [Phaser Examples](https://labs.phaser.io)
