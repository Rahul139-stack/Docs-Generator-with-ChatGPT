# Docs Generator Extension for VS code

This is the README for the "docs-generator" extension.

## Features

- **Generate Docs**: This feature allows you to select a folder and get an explanation of the code in understandable technical words. It also works for subfolder files documentation of the selected folder.

## `vscode` module

- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`window.showInformationMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage)

## Running the Sample

- Run `npm install` in the terminal to install dependencies.
- Run the `Run Extension` target in the Debug View.
- Right-click on the folder and run `Generate Extension`.

## Requirements

- `Node` Installed
- To use this extension, you need an internet connection to access the OpenAI API.

## Extension Settings

This extension contributes the following settings:
- It should update the "docs-generator.apiKey" attribute in the `settings.json`:
  "docs-generator": {
  "apiKey": "YOUR_API_KEY"
  },
- Example:
  "docs-generator": {
  "apiKey": "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"
  },

  
## Create API KEY

To create an API key for OpenAI's GPT models, including ChatGPT, you can follow these steps:

1. Go to the OpenAI website at https://openai.com/.
2. Sign in to your OpenAI account. If you don't have an account, you'll need to create one.
3. Once you're signed in, navigate to the API section or go directly to https://platform.openai.com/signup.
4. Follow the instructions to sign up for the API access or join the waitlist if it's currently restricted.
5. Once you have access to the API, you can generate an API key. The process may vary depending on OpenAI's current procedures and requirements.
6. Typically, you'll need to provide relevant information and agree to any terms and conditions specified by OpenAI.
7. After successfully completing the process, you'll receive an API key that you can use to authenticate your requests to the OpenAI API.

## Release Notes

### Latest Update

#### 1.0.0

Initial release of `Docs-Generator Extension`

## Feedback and Contributions

If you encounter any issues, have suggestions, or want to contribute to the extension, please feel free to submit an issue or pull request on the [GitHub repository](https://github.com/Rahul139-stack/Docs-Generator-with-ChatGPT).

Your feedback and contributions are highly appreciated!

**Enjoy!**
