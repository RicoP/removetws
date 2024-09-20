import * as vscode from 'vscode';

function log(str: string) {
	//console.log(str);
}

export function activate(context: vscode.ExtensionContext) {
	log("Activate");

	let changedLinesMap: Map<string, Set<number>> = new Map();

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
		const document = event.document;
		const documentUri = document.uri.toString();
	
		if (!changedLinesMap.has(documentUri)) {
			changedLinesMap.set(documentUri, new Set<number>());
		}
		
		const changedLines = changedLinesMap.get(documentUri)!;

		// Record each line that was changed
		for (const change of event.contentChanges) {
			const startLine = change.range.start.line;
			const endLine = change.range.end.line;
	
			for (let i = startLine; i <= endLine; i++) {
				changedLines.add(i);
				log(`Line changed ${i}`);
			}
		}
	}));

    // Register a listener that is triggered on document save
    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(event => {
		const document = event.document;
		const documentUri = document.uri.toString();
	
		// Get the changed lines for this document
		const changedLines = changedLinesMap.get(documentUri);

		if(!changedLines) {
			return;
		}
	
		for (const lineNumber of changedLines) {
            const lineText = document.lineAt(lineNumber).text;
            log(`Changed Line ${lineNumber + 1}: ${lineText}`);
			
			const edit = new vscode.WorkspaceEdit();

			// Check if the line has trailing whitespace
			const trimmedText = lineText.replace(/\s+$/, '');
			if (trimmedText !== lineText) {
				// Replace the line with trimmed text
				const range = new vscode.Range(lineNumber, 0, lineNumber, lineText.length);
				edit.replace(document.uri, range, trimmedText);
				log(`replace text in line ${lineNumber+1}: ${trimmedText}`);
			}

            // Apply the edit to the document
            vscode.workspace.applyEdit(edit);
        }

        // Clear the changes for this document after logging
        changedLinesMap.delete(documentUri);
    }));
}

export function deactivate() {}
