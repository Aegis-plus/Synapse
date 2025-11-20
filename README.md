# Synapse

Synapse is a project built with Vite and React, designed to process and display markdown content. It leverages libraries like `react-markdown` and `react-syntax-highlighter` to provide a rich viewing experience for markdown, including code blocks.

## Features

*   **Markdown Rendering:** Renders markdown content using `react-markdown` and `remark-gfm`.
*   **Code Syntax Highlighting:** Supports syntax highlighting for code blocks via `react-syntax-highlighter`.
*   **React-based:** Built with modern React practices.
*   **Vite for Development:** Fast development server and build process powered by Vite.

## Setup and Installation

To get started with Synapse locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd synapse
    ```
    *(Note: Replace `[your-repository-url]` with the actual URL of your Synapse repository)*

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will start the development server, typically on `http://localhost:3000`.

## Usage

Once the development server is running, you can access the application in your browser. The application is designed to process and display markdown content.

## Environment Variables

This project requires the following environment variable to be set:

*   `API_KEY`: Your primary API key for application functionality.

**Note:** The Gemini API key is not used in this version of the application.

## Deployment to Vercel

Deploying Synapse to Vercel is straightforward:

1.  **Connect to Vercel:**
    *   Sign up or log in to your Vercel account.
    *   Create a new project by importing your Git repository. Vercel will automatically detect the Vite framework.

2.  **Configure Environment Variables:**
    *   In your Vercel project settings, navigate to "Environment Variables".
    *   Add a new environment variable named `API_KEY` and paste your valid API key.

3.  **Build and Deploy:**
    *   Vercel will automatically build and deploy your project using the `npm run build` command.

Your project should now be deployed and accessible via a Vercel URL.
