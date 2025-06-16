# ProjectM Visualizer — Official Website

[🔗 Visit the Website](https://projectm-visualizer.org)

Welcome to the official website of the **ProjectM Visualizer** organization. This site serves as a central hub for our visualizer-related projects, resources, and community updates.

---

## 🛠 Development Setup

Follow these steps to get the site running locally:

### 1. Clone the Repository
```bash
git clone https://github.com/projectM-visualizer/projectm-visualizer.org
cd projectm-visualizer.org
```

### 2. Install bun.sh
#### Linux / macOS
```bash
curl -fsSL https://bun.sh/install | bash
```
#### Windows
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 3. Install dependencies:
```bash
bun install
```

### 4. Start the development server:
```bash
bun dev
```

### 5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the website.

<br>

## ⚠️ Known Issues

- `bun install` may fail on Windows due to missing `node-gyp`. This is caused by `better-sqlite3`.
  - To fix this, you can run `npm install` followed by `bun install` to install the dependencies.
  - This will then allow you to utilize the environment without issues.
  - Linux has no issues with this.
