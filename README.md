# SRT Translation

This project provides an API to translate SRT subtitle files into Vietnamese using the Gemini API.

## Prerequisites

- Node.js and npm installed
- Vercel account

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/bihv/subtitle-translate-web.git
   cd subtitle-translate-web
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Ensure your `package.json` includes the necessary scripts for deployment and testing.

## Running Locally

To run the project locally, use the following command:

```sh
npm run dev
```

## Deploying to Vercel

1. Install the Vercel CLI:

   ```sh
   npm install -g vercel
   ```

2. Log in to Vercel:

   ```sh
   vercel login
   ```

3. Initialize the project with Vercel:

   ```sh
   vercel
   ```

   Follow the prompts to set up the project. When asked for the root directory, specify the directory containing your `api` folder.

4. Set up environment variables on Vercel:

   - Go to your project dashboard on Vercel.
   - Navigate to the "Settings" tab.
   - Add the environment variable `GEMINI_API_KEY` with your actual API key.

5. Deploy the project:

   ```sh
   vercel --prod
   ```

## Usage

Once deployed, you can use the web endpoint provided by Vercel. For example https://your-vercel-endpoint


## License

This project is licensed under the MIT License.

