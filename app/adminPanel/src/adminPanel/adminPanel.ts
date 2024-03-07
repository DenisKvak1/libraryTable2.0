import {
  adminPanelOption, createOptionKitAP,
  iAdminPanel,
  iModal,
  iModalPlugin,
  iObservable, iPlugin,
  iTableController, IactionList,
  PLUGIN_STATE, toKitOption,
  universalTableOption
} from "../../../../env/types";
import { Observable } from "../../../../env/helpers/observable";
import { InfoList } from "../modules/infoList/infoList";
import { appendChild } from "../../../../env/helpers/appendRemoveChildDOMElements";
import { ActionList } from "../modules/actionList/actionList";
import { createElementFromHTML } from "../../../../env/helpers/createElementFromHTML";
import {
  adminPanelDropdown,
  adminPanelOptionCheckBox,
  adminPanelOptionColor,
  adminPanelOptionInput,
  adminPanelTemplate
} from "./template";

export class AdminPanel implements iAdminPanel {
  name: string;
  state$: iObservable<PLUGIN_STATE>;
  controller: iTableController;
  private modal: iModal;
  private options: Array<adminPanelOption>;
  private startOption: universalTableOption;
  private createOptionKit: createOptionKitAP;
  private dropdownContainer: HTMLElement;
  private appearanceOptions: Array<adminPanelOption>;
  private actionOptions: Array<adminPanelOption>;
  private defaultOptions: {[key: string]: any}
  private adminPanel: HTMLElement
  constructor() {
    this.name = "adminPanel";
    this.state$ = new Observable<PLUGIN_STATE>(PLUGIN_STATE.INITIALIZED);
  }

  registration(controller: iTableController) {
    this.controller = controller;
    this.state$.next(PLUGIN_STATE.ADDED);
    this.state$.next(PLUGIN_STATE.PENDING);
    this.state$.subscribe(() => {
      controller.pluginEvent$.next(this);
    });
    if (this.controller.getPlugin("modal").plugin?.state$.getValue() === PLUGIN_STATE.READY) {
      this.init();
      this.state$.next(PLUGIN_STATE.READY);
    } else {
      this.controller.pluginEvent$.subscribe((event) => {
        if (event.name === "adminPanel") return;

        let modalInfo = this.controller.getPlugin("modal");
        if (!modalInfo.isPresent) return;
        if (modalInfo.plugin.state$.getValue() === PLUGIN_STATE.READY && (this.state$.getValue() !== PLUGIN_STATE.READY && this.state$.getValue() !== PLUGIN_STATE.REMOVED)) {
          this.init();
          this.state$.next(PLUGIN_STATE.READY);
        }
      });
    }
    this.controller.pluginEvent$.subscribe((event: iPlugin) => {
      if (event.name === "adminPanel") return;
      if (this.controller.getPlugin("modal").plugin?.state$.getValue() !== PLUGIN_STATE.READY) {
        if (this.state$.getValue() === PLUGIN_STATE.PENDING) return;
        this.unload()
        this.state$.next(PLUGIN_STATE.PENDING);
      }
    });
  }

  private init() {
    this.initStartOptions()
    this.initOptions()
    this.renderOpenPanel();
    this.initCreatePack()
    if (this.startOption) {
      this.options.forEach((item) => {
        item.options.startValue = (this.startOption as any)[item.correspondence];
      });
    }
    let modalPlugin = this.controller.getPlugin("modal").plugin as iModalPlugin;
    this.adminPanel = this.createAdminPanel();

    this.modal = modalPlugin.createModal(this.adminPanel);
    this.modal.close$.subscribe(() => this.dropdownContainer.style.display = "flex");
    this.modal.setOptions({ padding: "0px", borderRadius: "10px" });
  }
  private initStartOptions(){
    let startOption = localStorage.getItem("tableCell");
    let startDenyPlugin = localStorage.getItem("denyPlugin");
    if (startOption) {
      if (startDenyPlugin) {
        this.startOption = { ...JSON.parse(startOption), denyPlugins: JSON.parse(startDenyPlugin) };
      } else {
        this.startOption = { ...JSON.parse(startOption), denyPlugins: [] };
      }
    }
    this.defaultOptions = {
      "widthVerticalLine": "1px",
      "widthHorizontalLine": "1px",
      "colorBackgroundHeader": "#FFFFFF",
      "colorBackgroundCell": "#FFFFFF",
      "colorBackgroundFooter": "#F2F2F2",
      "colorEditableBackgroundCell": "#FFFFFF",
      "colorHeader": "#000000",
      "colorBody": "#000000",
      "colorFooter": "#000000",
      "colorEditableCell": "#000000",
      "colorLine": "#000000",
      denyPlugins: [],
      showVerticalLine: true,
      showHorizontalLine: true,
      showHeader: true,
      showFooter: true
    };
  }
  private initOptions(){
    this.appearanceOptions = [
      this.createCheckBoxOption("Показывать вертикальные линии", true, 'showVerticalLine'),
      this.createCheckBoxOption("Показывать горизонтальные линии", true, 'showHorizontalLine'),
      this.createCheckBoxOption("Показывать заголовок таблицы", true, 'showHeader'),
      this.createCheckBoxOption("Показывать футер таблицы", true, 'showFooter'),
      this.createInputOption("Толщина вертикальной линии", "1px", 'widthVerticalLine', "^\\d{1,}(px|em)$"),
      this.createInputOption("Толщина горизонтальной линии", "1px", 'widthHorizontalLine', "^\\d{1,}(px|em)$"),
      this.createColorOption("Цвет фона заголовка", "#FFFFFF", 'colorBackgroundHeader'),
      this.createColorOption("Цвет фона ячеек", "#FFFFFF", 'colorBackgroundCell'),
      this.createColorOption("Цвет фона футера", "#F2F2F2", 'colorBackgroundFooter'),
      this.createColorOption("Цвет текста заголовков", "#000000", 'colorHeader'),
      this.createColorOption("Цвет текста ячеек", "#000000", 'colorBody'),
      this.createColorOption("Цвет текста футера", "#000000", 'colorFooter'),
      this.createColorOption("Цвет фона редактируемой ячейки", "#FFFFFF", 'colorEditableBackgroundCell'),
      this.createColorOption("Цвет текста редактируемой ячейки", "#000000", 'colorEditableCell'),
      this.createColorOption("Цвет линий таблицы", "#000000", 'colorLine')
    ];
    this.actionOptions = [
      this.createCheckBoxOption("Запретить редактирование ячеек", false, 'denyEditCell'),
      this.createCheckBoxOption("Запретить изменение размера столбцов", false, 'denyResizeColumn'),
      this.createCheckBoxOption("Запретить добавление столбцов", false, 'denyAddColumn'),
      this.createCheckBoxOption("Запретить добавление строк", false, 'denyAddRow'),
      this.createCheckBoxOption("Запретить удаление столбцов", false, 'denyRemoveColumn'),
      this.createCheckBoxOption("Запретить удаление строк", false, 'denyRemoveRow'),

      this.createActionListOption(
        "Список запрещёных плагинов:",
        [],
        "Запретить плагин: ",
        "Запретить",
        "red",
        (actionList: IactionList) => {
          actionList.elements$.subscribe((data) => {
            this.controller.denyPlugins$.next(data);
          });
          this.options.find((item) => item.correspondence === "denyPlugins").elementObject = actionList;
        },
        'denyPlugins'
      )
    ];
    this.options = [...this.appearanceOptions, ...this.actionOptions];
  }
  private initCreatePack(){
    this.createOptionKit = {
      input: (options: toKitOption) => {
        let option = createElementFromHTML(adminPanelOptionInput)
        let span = option.querySelector('span');
        let input = option.querySelector('input')
        input.oninput = () => this.saveOptions.bind(this)();
        span.textContent = options.placeholder;

        if (options.startValue) {
          input.value = options.startValue as string;
        }
        appendChild(option, span);
        appendChild(option, input);

        return option;
      },
      checkBox: (options: toKitOption) => {
        let option = createElementFromHTML(adminPanelOptionCheckBox)
        let span = option.querySelector('span');
        let input = option.querySelector('input')
        input.type = "checkbox";
        span.textContent = options.placeholder;
        input.checked = options.startValue as boolean;
        input.onchange = () => this.saveOptions.bind(this)();

        appendChild(option, span);
        appendChild(option, input);

        return option;
      },
      color: (options: toKitOption) => {
        let option = createElementFromHTML(adminPanelOptionColor)
        let span = option.querySelector('span');
        let input = option.querySelector('input')
        input.type = "color";
        span.textContent = options.placeholder;
        input.value = options.startValue as string;
        input.onchange = () => this.saveOptions.bind(this)();

        appendChild(option, span);
        appendChild(option, input);

        return option;
      },
      actionList: (options: toKitOption) => {
        let actionList = new ActionList(options.placeholder, options.startValue as Array<string>, options.inputOverview, options.buttonOverview);
        if (options.registerCallback) {
          options.registerCallback(actionList);
        }
        let element = actionList.createList();
        if (options.color) {
          actionList.setTextColor(options.color);
        }
        return element;
      }
    };
  }
  private createCheckBoxOption(placeholder:string, startValue:boolean, correspondence:string){
    return {
      type: 'checkBox',
      options: {
        placeholder: placeholder,
        startValue: startValue,
      },
      correspondence: correspondence,
    }
  }
  private createInputOption(placeholder:string, startValue:string, correspondences:string, regExp: string):adminPanelOption{
    return {
      type: 'input',
      options: { placeholder: placeholder, startValue: startValue },
      regExp: regExp,
      correspondence: correspondences
    }
  }
  private createColorOption(placeholder:string, startValue:string, correspondence:string):adminPanelOption {
    return {
      type: 'color',
      options: { placeholder: placeholder, startValue: startValue},
      regExp: "^#[0-9A-Fa-f]{6}$",
      correspondence: correspondence
    }
  }
  private createActionListOption(placeholder:string, startValue:Array<string>, inputOverview:string, buttonOverview:string, color:string, registerCallback: Function, correspondence:string){
    return {
      type: "actionList",
      options:
        {
          placeholder: placeholder,
          startValue: startValue,
          inputOverview: inputOverview,
          buttonOverview: buttonOverview,
          color: color,
          registerCallback: registerCallback
        },

      correspondence: correspondence
    }
  }
  private renderOpenPanel() {
    this.dropdownContainer = createElementFromHTML(adminPanelDropdown)
    let content = this.dropdownContainer.querySelector('.content') as HTMLButtonElement
    content.onclick = () => {
      this.dropdownContainer.style.display = "none";
      this.modal.open();
    };
    appendChild(this.dropdownContainer, content);
    appendChild(document.body, this.dropdownContainer);
  }

  private createAdminPanel():HTMLElement {
    const adminPanel = createElementFromHTML(adminPanelTemplate);
    const selectOptionBlockBtn1:HTMLElement = adminPanel.querySelector('.selectOptionBlockBtn');
    const selectOptionBlockBtn2:HTMLElement = adminPanel.querySelector('.selectOptionBlockBtn.noneActive');
    const appearanceBlock:HTMLElement = adminPanel.querySelector('.option_block.appearance');
    const actionBlock:HTMLElement = adminPanel.querySelector('.option_block.action');

    selectOptionBlockBtn1.addEventListener('click', () => {
      appearanceBlock.style.display = 'flex';
      actionBlock.style.display = 'none';
      selectOptionBlockBtn1.classList.add('active');
      selectOptionBlockBtn2.classList.remove('active');
    });

    selectOptionBlockBtn2.addEventListener('click', () => {
      appearanceBlock.style.display = 'none';
      actionBlock.style.display = 'flex';
      selectOptionBlockBtn1.classList.remove('active');
      selectOptionBlockBtn2.classList.add('active');
    });

    const actionBtn1 = adminPanel.querySelector('.actionBtn:nth-of-type(1)');
    const actionBtn2 = adminPanel.querySelector('.actionBtn:nth-of-type(2)');
    const fileInput = adminPanel.querySelector('.fileConfigInput');

    actionBtn1.addEventListener('click', () => this.setOption(this.defaultOptions));
    actionBtn2.addEventListener('click', () => this.saveJsonFile.bind(this)(JSON.stringify(this.toTableOptions())));
    fileInput.addEventListener('change', (event) => this.loadHandler.bind(this)(event));

    this.renderOptions(appearanceBlock, this.appearanceOptions);
    this.renderOptions(actionBlock, this.actionOptions);

    const blockInfo = new InfoList('Список установленных плагинов', []);
    const blockInfoElement = blockInfo.createList();
    this.controller.pluginEvent$.subscribe(() => {
      const plugList = Object.values(this.controller.plugins)
        .filter(plugin => plugin && plugin.state$.getValue() !== PLUGIN_STATE.REMOVED)
        .map(plugin => plugin.name);
      blockInfo.setList(plugList);
    });

    actionBlock.appendChild(blockInfoElement);
    return adminPanel;
  }

  private renderOptions(block: HTMLElement, options: Array<adminPanelOption>) {
    for (let i = 0; i < options.length; i++) {
      if ((this.createOptionKit as any)[options[i].type]) {
        let option = (this.createOptionKit as any)[options[i].type](options[i].options);
        options[i].element = option;
        appendChild(block, option);
      }
    }
  }

  private saveOptions() {
    let resultOptions = this.toTableOptions();
    if (resultOptions) {
      localStorage.setItem("tableCell", JSON.stringify(resultOptions));
      this.controller.table.setOptions(resultOptions);
    }
  }

  private toTableOptions(): void | universalTableOption {
    let resultOptions: universalTableOption = {};
    let error: Array<number> = [];
    for (let i = 0; i < this.options.length; i++) {
      let value: string | Array<string> = (this.options[i].element.children[1] as HTMLInputElement).value;
      const inputValue = value;
      if(this.options[i].regExp){
        const regExp = new RegExp(this.options[i].regExp);
        if (!regExp.test(inputValue)) {
          error.push(i);
          this.options[i].element.style.boxShadow = "0 0 10px red";
        } else {
          this.options[i].element.style.boxShadow = "initial";
        }
      }
    }


    for (let i = 0; i < this.options.length; i++) {
      if (error.includes(i)) continue;

      let value: string | boolean | Array<string>;
      if (this.options[i].type === "input" || this.options[i].type === "color") {
        value = (this.options[i].element.children[1] as HTMLInputElement).value;
      } else if (this.options[i].type === "checkBox") {
        value = (this.options[i].element.children[1] as HTMLInputElement).checked;
      } else if (this.options[i].type === "actionList") {
        value = this.options[i].elementObject.elements$.getValue();
      }
      (resultOptions as any)[this.options[i].correspondence] = value;
    }
    return resultOptions;
  }

  setOption(options: universalTableOption) {
    for (let key in options) {
      let input = this.options.find((item) => item.correspondence === key);
      if (input) {
        if (input.type === "color" || input.type === "input") {
          const inputElement = input.element.children[1] as HTMLInputElement;
          inputElement.value = (options as any)[key] as string;
        } else if (input.type === "checkBox") {
          const inputElement = input.element.children[1] as HTMLInputElement;
          inputElement.checked = (options as any)[key] as boolean;
        } else if (input.type === "actionList") {
          input.elementObject.setList((options as any)[key]);
        }
      }
    }
    this.saveOptions();
  }

  private async saveJsonFile(fileContent: string) {
    let blob = new Blob([fileContent], { type: "application/json" });

    try {
      let fileHandle = await window.showSaveFilePicker({
        suggestedName: `tableConfig_${new Date().toISOString().split("T")[0]}`,
        types: [
          {
            description: "tableConfig",
            accept: {
              "application/json": [".json"]
            }
          }
        ]
      });

      let writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

    } catch (error) {

    }
  }

  private async loadHandler(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          let jsonObject: {[key: string]: any};

          if (typeof event.target.result === "string") {
            jsonObject = JSON.parse(event.target.result);
          }
          this.setOption(jsonObject);
        } catch (error) {
          this.controller.error$.next(`Ошибка при разборе JSON: ${error}`);
        }
      };

      reader.readAsText(file);
    } else {
      this.controller.error$.next("Файл не выбран");
    }
    fileInput.value = "";
  }
  private unload(){
    this.adminPanel.remove()
    this.dropdownContainer.remove()
    this.modal.destroy()
  }
  unRegister() {
    this.unload()
    this.state$.next(PLUGIN_STATE.REMOVED);
  }
}