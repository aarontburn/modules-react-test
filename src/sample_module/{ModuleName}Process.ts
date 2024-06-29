import * as path from "path";
import * as fs from "fs";
import { Process } from "./module_builder/Process";
import { IPCCallback } from "./module_builder/IPCObjects";
import { Setting } from "./module_builder/Setting";
import { BooleanSetting } from "./module_builder/settings/types/BooleanSetting";



export class SampleModuleProcess extends Process {

    private static readonly MODULE_NAME = "Sample Module";
    private static readonly MODULE_ID = "developer.Sample_Module";

    /** @htmlpath */
    private static readonly HTML_PATH: string = path.join(__dirname, "./{ModuleName}HTML.html").replace("dist", "src");

    /**
     *  The constructor. Should not directly be called, 
     *      and should not contain logic relevant to the renderer.
     */
    public constructor(ipcCallback: IPCCallback) {
        super(
            SampleModuleProcess.MODULE_ID,
            SampleModuleProcess.MODULE_NAME,
            SampleModuleProcess.HTML_PATH,
            ipcCallback);

        setTimeout(() => {
            if (!this.isInitialized()) {
                console.error("Error: has not received signal from renderer. Verify the MODULE_ID matches the renderers.")
                console.error("\tListening to: " + SampleModuleProcess.MODULE_ID);
            }
        }, 3000);
    }

    /**
     *  The entry point of the module. Will be called once the 
     *      renderer sends the 'init' signal.
     */
    public initialize(): void {
        super.initialize(); // This should be called.

        this.sendToRenderer('module-details', {
            name: SampleModuleProcess.MODULE_NAME,
            id: SampleModuleProcess.MODULE_ID
        });

        fs.promises.readdir(__dirname, { withFileTypes: true }).then((files: fs.Dirent[]) => {
            this.sendToRenderer('files', files);
        });
    }


    public registerSettings(): (Setting<unknown> | string)[] {
        return [
            "Sample Setting Group",
            new BooleanSetting(this)
                .setDefault(false)
                .setName("Sample Toggle Setting")
                .setDescription("An example of a boolean setting!")
                .setAccessID('sample_bool')
        ];
    }


    public refreshSettings(modifiedSetting?: Setting<unknown>): void {
        if (modifiedSetting?.getAccessID() === 'sample_bool') {
            this.sendToRenderer('sample-setting', modifiedSetting.getValue());
        }
    }

    public handleEvent(eventType: string, data: any[]): void {
        switch (eventType) {
            case "init": {
                this.initialize();
                break;
            }
        }
    }

}