# Modules: Developer Quickstart Template
Author: [@aarontburn](https://github.com/aarontburn)  
Module template required for [modules](https://github.com/aarontburn/modules)

# Template Installation
To start, clone the template and do 
```
    npm install
```
to install any required packages.

# Getting Started
![image](https://github.com/aarontburn/modules-module_develop/assets/103211131/a5770453-b34a-42f1-9e67-3a9c9347e922)

This is what the initial template should look like. All assets related to your module should remain within the `sample_module` directory.

Do not modify the contents of `module_builder` or any other files, as those changes will not be saved when used in the main application.

## @Annotations
Inspired by Java's Annotations, several locations in the template have an @annotation before it. These annotations **must be present to properly compile your plugin.**

All required annotations are already in the template; you shouldn't need to add any additional ones. 


Example 1: [{MODULE_NAME}HTML.html](https://github.com/aarontburn/modules-module_develop/blob/main/src/sample_module/%7BMODULE_NAME%7DHTML.html)
```
    ...
    <!-- @css -->
    <link rel="stylesheet" href="../../colors.css">
    ...
```

Example 2: [{MODULE_NAME}Process.ts](https://github.com/aarontburn/modules-module_develop/blob/main/src/sample_module/%7BMODULE_NAME%7DProcess.ts)  

```
    ...
    // Modify this to match the path of your HTML file.
    /** @htmlpath */
    private static HTML_PATH: string = path.join(__dirname, "./{MODULE_NAME}HTML.html").replace("dist", "src");
    ...
```
When compiling your module, the main application will look for the @annotations and, when found, will directly modify the next line. This means, unless specified, the line directly under an @annotation **must remain on a single line.**

Valid HTML, but will break compiling:
```
    ...
    <!-- @css -->
    <link 
        rel="stylesheet" 
        href="../../colors.css">
    ...
```


## Renaming
To be safe, rename all `{MODULE_NAME}` to the same thing.

1. Rename the `sample_module` directory to the name of your module. 
2. Rename `{MODULE_NAME}.css` to a proper name. **[NOT STRICT]**
3. Rename `{MODULE_NAME}Renderer.ts` to a proper name.
4. Rename `{MODULE_NAME}Process.ts` to a proper name.  
\* This file **MUST** end with `Process.ts`
5. Rename `{MODULE_NAME}HTML.html` to a proper name.
6. In `{MODULE_NAME}HTML.html`, modify the CSS `<link>`  `href`'s location to the name of your CSS file (in step 2).
```
    <!-- Modify this for the name to the name of your CSS file. -->
    <link rel="stylesheet" href="{MODULE_NAME}.css">
```

7. In `{MODULE_NAME}HTML.html`, modify the `<script>`'s `src` to point towards your renderer. Rename `sample_module` to the name of the directory (from step 1) and `{MODULE_NAME}Renderer` to the name of your renderer (from step 3).

```
    <!-- Note: This script tag NEEDS to stay a single line. -->
    <!-- @renderer -->
    <script defer src="../../dist/sample_module/{MODULE_NAME}Renderer.js"></script>
```

8. In `{MODULE_NAME}Process.ts`, modify the `MODULE_NAME` variable to the name of your module and the `HTML_PATH` variable to point towards your HTML file (from step 5).
```
    // Modify this to the name of your module.
    private static MODULE_NAME = "{MODULE_NAME}"; // MUST MATCH RENDERER

    // Modify this to match the path of your HTML file.
    /** @htmlpath */
    private static HTML_PATH: string = path.join(__dirname, "./{MODULE_NAME}HTML.html").replace("dist", "src");
```

9. In `{MODULE_NAME}Renderer.ts`, modify the `MODULE_NAME` variable to EXACTLY what you modifed the `MODULE_NAME` variable in step 8.
```
    // Change this to EXACTLY what is in the {MODULE_NAME}Module.MODULE_NAME field.
    const MODULE_NAME = "{MODULE_NAME}" // MUST MATCH PROCESS
```

10. In `ModuleController.ts`, modify the `import` statement to properly import your `{MODULE_NAME}Process.ts` file.
```
    // Update this import statement
    import { SampleProcess } from "./sample_module/{MODULE_NAME}Process";
```

## Running the application
After modifying the specified files, you should be ready to start developing your module. 

In the terminal, execute the command:
```
    npm start
```
![image](https://github.com/aarontburn/modules-module_develop/assets/103211131/4aff1dc8-d286-4414-a57f-6b408f3903ed)  
If no exceptions are thrown, and the terminal looks similar to this, you have correctly installed and renamed things.


# Developing your Module
## Quick Tips:
1. Electron is Chromium based. That means you have access to the Chrome Developer tools, either through the menu bar (`View > Toggle Developer Tools`), or by keyboard shortcut (`CTRL + SHIFT + I`)


## Module Structure
Each module consists of a few required files:
- Process: The "main" of your module. Serves as the backend and is what connects the main application to your module.
- Renderer: The frontend of your module. In an isolated context and only handles DOM manipulation.
- HTML: The structure of your frontend.
- CSS: Styling for the HTML (not technically required but added for ease of development)


## Process Structure `{MODULE_NAME}Process.ts`
The process file is the backend of your module. It has full access to Node packages. It does not have direct access to the frontend - you will need to communicate and send data to the frontend and do the updating there.

All `console.log()` will output to the terminal.


## Renderer Structure `{MODULE_NAME}Renderer.ts`
The renderer file is the frontend of your module. It has **NO ACCESS** to Node packages, including `require` or `import`.

It does have access to the DOM. You should send data from the process, receive it in the renderer, and use that information to update the frontend. 

All `console.log()` will output to the developer console.


## Communicating Between the Processs and Renderer
Electron uses Inter-Process Communication (IPC) to communicate between the process and renderer. There are pre-defined functions in both the process and renderer files to simplify this process.

### Process
#### Sending an event TO the renderer
```
    public notifyObservers(eventType: string, ...data: any): void { ... }
    
    this.notifyObservers("{EVENT_NAME}", {EVENT_DATA_1}, {EVENT_DATA_2}, ...);
```
This function is used by the process to communicate to the renderer.  

`eventType`: A name for the event.  
`...data`: Data to send to the renderer, if any.

#### Receiving an event FROM the renderer
```
    public receiveIPCEvent(eventType: string, data: any[]): void {
        switch (eventType) {
            case "init": {
                this.initialize();
                break;
            }
            case "sample_event_from_renderer": {
                console.log("Received from renderer: " + data);
                break;
            }

        }
    }
```

This function receives events from the renderer.  
`eventType`: The name of the event.  
`data`: All data passed from the renderer, if any.

### Renderer
#### Sending an event TO the process
```
    const sendToProcess = (eventType: string, ...data: any): void => { }
    
    sendToProcess("sample_event_from_renderer", "sample data 1", "sample data 2");

```
#### Receiving an event FROM the process
```
    window.parent.ipc.on(MODULE_RENDERER_NAME, (_, eventType: string, data: any[]) => {
        data = data[0]; // Data is wrapped in an extra array.
        switch (eventType) {
            case "sample_event": {
                console.log("Received from process: " + data);
                sendToProcess("sample_event_from_renderer", "sample data 1", "sample data 2");
                break;
            }
        }
    });
```


# Exporting your Module
After you finish developing your module, you may export it using an included Python script.

`EXPORT.py` is a script to export your module and its dependencies. Open the script in an editor.

```
...

"""
Usage Information:
Change this to the name of the folder containing your module
"""
FOLDER_NAME = 'sample_module' # Change this to the name of the folder containing your module

...
```
`FOLDER_NAME` is the only thing needed for the script to locate the required files; modify it to be the name of the folder your module lives in ([from step 1 of renaming](#renaming)).

Running this script will produce a new directory `output/`, which should contain a folder with an identical name to `FOLDER_NAME`. Inside are all of the files needed, alongside `node_modules/` if you used external packages, and an empty directory `module_builder` which is needed by the compiler.

Drag this folder to `{HOME_PATH}/.modules/external_modules/`.

