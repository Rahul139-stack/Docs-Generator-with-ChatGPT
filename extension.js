const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const openai = require("openai");
const { default: axios } = require("axios");

// Function to retrieve the API key from the settings.json file
function getAPIKey() {
  const configuration = vscode.workspace.getConfiguration("docs-generator");
  return configuration.get("apiKey", "");
}
//xq5aiwx52g5vuysugejazdwqggyzxjkjscrvp5lny35rzl4oearq
// Function to prompt the user to enter the API key
async function promptAPIKey() {
  console.log("promtffgg")
  const inputBoxOptions = {
    prompt: "Enter your OpenAI API key",
    placeHolder: "API key",
    password: true,
  };

  const apiKey = await vscode.window.showInputBox(inputBoxOptions);
  console.log("apikey",apiKey)
  if (apiKey) {
    // Update the API key in the settings
    const configuration = vscode.workspace.getConfiguration();
    console.log("----->",configuration)
    await configuration.update("copy-text.apiKey", apiKey, true);
    console.log("--->",getAPIKey())
    vscode.window.showInformationMessage("API key has been updated successfully.");
    return apiKey;
  } else {
    vscode.window.showWarningMessage("API key not provided. Cannot generate documentation.");
    return null;
  }
}

// Command for generating documentation
async function generateDocumentationCommand() {
  console.log("generateDocumentation");

  // Prompt for the API key
  const apiKey = getAPIKey();
  if (!apiKey) {
    await promptAPIKey();
    return;
  }

  const folderUri = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: true,
    canSelectMany: false,
  });

  if (folderUri && folderUri.length > 0) {
    const folderPath = folderUri[0].fsPath;
    console.log("folderpath", folderPath);

    await generateDocumentation(folderPath);
  }
	else {
		vscode.window.showInformationMessage("No Folder selected");
	}
}

// Axios call.
// Configure and initialize the OpenAI API
const triggerAPI = async (responseOptions) => {
  const apiKey = getAPIKey();
  if (!apiKey) {
    // Prompt the user to set the API key in settings.json
    vscode.window.showInformationMessage("Please set your OpenAI API key in settings.json.");
    return null;
  }

  return await axios.post(
    "https://api.openai.com/v1/chat/completions",
    responseOptions,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  ).then(res => res).catch((error) => {
		// if its un authorized show the error message.
		if (error.response.status === 401) {
			vscode.window.showErrorMessage('Please enter a valid API key.');
		}
		// if limit exceeded show the error message.
		if (error.response.status === 402 || error.response.status === 429) {
			vscode.window.showErrorMessage('You have exceeded the API limit. Please try again after some time.');
		}
		throw error;
	});
};

async function generateDocumentation(folderPath) {
  const files = fs.readdirSync(folderPath);
  const codeSnippets = [];
  const fileNameArr = [];
  let parentFolderName = "";

  if (files.length > 0) {
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      console.log("filepath", filePath);
      parentFolderName = path.basename(path.dirname(filePath));
      console.log("parentFolderName", parentFolderName);
      const fileName = path.parse(filePath).base;

      if (fs.statSync(filePath).isDirectory()) {
        // Handle subfolder recursively
        await generateDocumentation(filePath);
      } else {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        fileNameArr.push(fileName);
        codeSnippets.push({ role: "user", content: `${fileContent}` });
      }
    }

    if (codeSnippets.length > 0) {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Processing your code with OpenAI....",
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 });

  

            // Call OpenAI API to generate response for each code snippet
            const generatedDocumentation = [];
            for (let i = 0; i < codeSnippets.length; i++) {
              const responseOptions = {
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "user",
                    content: `Display filename as heading # File:${fileNameArr[i]}  ## Code Explanation:Please provide a documentation for the following code:${codeSnippets[i].content}`,
                  },
                ],
                max_tokens: 2000,
                frequency_penalty: 0.2, //-0.2 - 0.2
                presence_penalty: 0,
              };

              let ans = "";
              do {
                const response = await triggerAPI(responseOptions);
                if (!response) {
                  return; // API key not available, stop generating documentation
                }
                const responseJson = response.data;
                const choices = responseJson.choices;
                const choice = choices[0];
                ans += choice.message.content;
                // finish_reason
                const finishReason = choice.finish_reason;
                if (finishReason === "stop") {
                  break;
                }
                responseOptions.messages.push({
                  role: "assistant",
                  content: choice.text,
                });
                responseOptions.messages.push({
                  role: "user",
                  content: "Please share the truncated text.",
                });
              } while (true);

              const generatedText = ans;
              generatedDocumentation.push(generatedText);

              progress.report({
                message: `Generating documentation for ${fileNameArr[i]}`,
                increment: ((i + 1) / codeSnippets.length) * 100,
              });
            }

            // Create or update documentation file
            const documentationPath = path.join(folderPath, "documentation.md");
            fs.writeFileSync(documentationPath, generatedDocumentation.join("\n\n"));

            vscode.window.showInformationMessage(
              "Documentation generated successfully for folder: " + parentFolderName
            );
          }
        );
      } catch (error) {
        vscode.window.showErrorMessage("Failed to generate documentation: " + error.message);
      }
    }
  } else {
    vscode.window.showInformationMessage("No files present in: " + folderPath);
  }
}

// Activate the extension
/**
 * @param {{ subscriptions: vscode.Disposable[]; }} context
 */
function activate(context) {
  console.log("activate");
  const disposable = vscode.commands.registerCommand(
    "docs-generator.generateDocumentation",
    generateDocumentationCommand
  );
  context.subscriptions.push(disposable);
}

exports.activate = activate;
