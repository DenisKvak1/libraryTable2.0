import {
  adminPanelOption,
  iAdminPanel,
  iModal,
  iModalPlugin,
  iObservable, iPlugin,
  iTableController, IUserList,
  PLUGIN_STATE,
  universalTableOption
} from "../../../env/types";
import { createElement } from "../../../env/helpers/createDOMElements";
import { Observable } from "../../../env/helpers/observable";
import { UserList } from "./modules/userList";
import { InfoList } from "./modules/infoList";
import { appendChild } from "../../../env/helpers/appendRemoveChildDOMElements";

export class AdminPanel implements iAdminPanel {
  name: string;
  state$: iObservable<PLUGIN_STATE>;
  controller: iTableController;
  private modal: iModal;
  private options: Array<adminPanelOption>;
  private readonly startOption: universalTableOption;
  private createOptionKit: Record<string, any>;
  private dropdownContainer: HTMLElement;
  private appearanceOptions: Array<adminPanelOption>;
  private actionOptions: Array<adminPanelOption>;
  private defaultOptions: Record<string, any>

  constructor() {
    let startOption = localStorage.getItem("tableCell");
    let startDenyPlugin = localStorage.getItem("denyPlugin");
    if (startOption) {
      if (startDenyPlugin) {
        this.startOption = { ...JSON.parse(startOption), denyPlugins: JSON.parse(startDenyPlugin) };
      } else {
        this.startOption = { ...JSON.parse(startOption), denyPlugins: [] };
      }
    }

    this.name = "adminPanel";
    this.state$ = new Observable<PLUGIN_STATE>(PLUGIN_STATE.INITIALIZED);
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
    this.createOptionKit = {
      input: (options: Record<string, any>) => {
        let option = createElement("div", ["input_option"]);
        let span = createElement("span");
        let input = createElement("input") as HTMLInputElement;
        input.oninput = () => this.saveOptions.bind(this)();
        span.textContent = options.placeholder;

        if (options.startValue) {
          input.value = options.startValue;
        }
        appendChild(option, span);
        appendChild(option, input);

        return option;
      },
      checkBox: (options: Record<string, any>) => {
        let option = createElement("div", ["checkBox_option"]);
        let span = createElement("span");
        let input = createElement("input", ["checkBox_optionInput"]) as HTMLInputElement;
        input.type = "checkbox";
        span.textContent = options.placeholder;
        input.checked = options.startValue;
        input.onchange = () => this.saveOptions.bind(this)();

        appendChild(option, span);
        appendChild(option, input);

        return option;
      },
      color: (options: Record<string, any>) => {
        let option = createElement("div", ["input_option"]);
        let span = createElement("span");
        let input = createElement("input", ["input_option"]) as HTMLInputElement;
        input.type = "color";
        span.textContent = options.placeholder;
        input.value = options.startValue;
        input.onchange = () => this.saveOptions.bind(this)();

        appendChild(option, span);
        appendChild(option, input);

        return option;
      },
      userList: (options: Record<string, any>) => {
        let userList = new UserList(options.placeholder, options.startValue, options.inputOverview, options.buttonOverview);
        if(options.registerCallback){
          options.registerCallback(userList)
        }
        let element = userList.createList();
        if (options.color) {
          userList.setTextColor(options.color);
        }
        return element;
      }
    };
    this.appearanceOptions = [
      {
        type: "checkBox",
        options: { placeholder: "Показывать вертикальные линии", startValue: true },
        regExp: "",
        correspondence: "showVerticalLine"
      },
      {
        type: "checkBox",
        options: { placeholder: "Показывать горизонтальные линии", startValue: true },
        regExp: "",
        correspondence: "showHorizontalLine"
      },
      {
        type: "checkBox",
        options: { placeholder: "Показывать заголовок таблицы", startValue: true },
        regExp: "",
        correspondence: "showHeader"
      },
      {
        type: "checkBox",
        options: { placeholder: "Показывать футер таблицы", startValue: true },
        regExp: "",
        correspondence: "showFooter"
      },
      {
        type: "input",
        options: { placeholder: "Толища вертикальной линии", startValue: "1px" },
        regExp: "^\\d{1,}(px|em)$",
        correspondence: "widthVerticalLine"
      },
      {
        type: "input",
        options: { placeholder: "Толища горизонтальной линии", startValue: "1px" },
        regExp: "^\\d{1,}(px|em)$",
        correspondence: "widthHorizontalLine"
      },
      {
        type: "color",
        options: { placeholder: "Цвет фона заголовка", startValue: "#FFFFFF" },
        regExp: "^#[0-9A-Fa-f]{6}$",
        correspondence: "colorBackgroundHeader"
      },
      {
        type: "color",
        options: { placeholder: "Цвет фона ячеек", startValue: "#FFFFFF" },
        regExp: "^#[0-9A-Fa-f]{6}$",
        correspondence: "colorBackgroundCell"
      },
      {
        type: "color",
        options: { placeholder: "Цвет фона футера", startValue: "#F2F2F2" },
        regExp: "^#[0-9A-Fa-f]{6}$",
        correspondence: "colorBackgroundFooter"
      },
      {
        type: "color",
        options: { placeholder: "Цвет текста заголовков", startValue: "#000000" },
        regExp: "^#[0-9A-Fa-f]{6}$",
        correspondence: "colorHeader"
      },
      {
        type: "color",
        options: { placeholder: "Цвет текста ячеек", startValue: "#000000" },
        regExp: "^#[0-9A-Fa-f]{6}$",
        correspondence: "colorBody"
      },
      {
        type: "color",
        options: { placeholder: "Цвет текста футера", startValue: "#000000" },
        regExp: "^#[0-9A-Fa-f]{6}$",
        correspondence: "colorFooter"
      },
      {
        type: "color",
        options: { placeholder: "Цвет фона редактируемой ячейки", startValue: "#FFFFFF" },
        regExp: "^#[0-9A-Fa-f]{6}$",
        correspondence: "colorEditableBackgroundCell"
      },
      {
        type: "color",
        options: { placeholder: "Цвет текста редактируемой ячейки", startValue: "#000000" },
        regExp: "^#[0-9A-Fa-f]{6}$",
        correspondence: "colorEditableCell"
      },
      {
        type: "color",
        options: { placeholder: "Цвет линий таблицы", startValue: "#000000" },
        regExp: "^#[0-9A-Fa-f]{6}$",
        correspondence: "colorLine"
      }

    ];
    this.actionOptions = [
      {
        type: "checkBox",
        options: { placeholder: "Запретить редактирование ячеек", startValue: false },
        regExp: "",
        correspondence: "denyEditCell"
      },
      {
        type: "checkBox",
        options: { placeholder: "Запретить изменение размера столбцов", startValue: false },
        regExp: "",
        correspondence: "denyResizeColumn"
      },
      {
        type: "checkBox",
        options: { placeholder: "Запретить добавление столбцов", startValue: false },
        regExp: "",
        correspondence: "denyAddColumn"
      },
      {
        type: "checkBox",
        options: { placeholder: "Запретить добавление строк", startValue: false },
        regExp: "",
        correspondence: "denyAddRow"
      },
      {
        type: "checkBox",
        options: { placeholder: "Запретить удаление столбцов", startValue: false },
        regExp: "",
        correspondence: "denyRemoveColumn"
      },
      {
        type: "checkBox",
        options: { placeholder: "Запретить удаление строк", startValue: false },
        regExp: "",
        correspondence: "denyRemoveRow"
      },
      {
        type: "userList",
        options:
          {
            placeholder: "Список запрещёных плагинов:",
            startValue: [],
            inputOverview: "Запретить плагин: ",
            buttonOverview: "Запретить",
            color: "red",
            registerCallback: (userList: IUserList) => {
              userList.elements$.subscribe((data) => {
                this.controller.denyPlugins$.next(data);
              });
              this.options.find((item)=>item.correspondence === "denyPlugins").elementObject = userList
            }
          },
        regExp: "",
        correspondence: "denyPlugins"

      }
    ];
    this.options = [...this.appearanceOptions, ...this.actionOptions];
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
        if (modalInfo.plugin.state$.getValue() === PLUGIN_STATE.READY && this.state$.getValue() !== PLUGIN_STATE.READY) {
          this.init();
          this.state$.next(PLUGIN_STATE.READY);
        }
      });
    }
    this.controller.pluginEvent$.subscribe((event: iPlugin) => {
      if (event.name === "adminPanel") return;
      if (this.controller.getPlugin("modal").plugin?.state$.getValue() !== PLUGIN_STATE.READY) {
        if (this.state$.getValue() === PLUGIN_STATE.PENDING) return;
        this.state$.next(PLUGIN_STATE.PENDING);
      }
    });
  }

  private init() {
    this.renderOpenPanel();
    if (this.startOption) {
      this.options.forEach((item) => {
        item.options.startValue = this.startOption[item.correspondence];
      });
    }
    let modalPlugin = this.controller.getPlugin("modal").plugin as iModalPlugin;
    let adminPanel = this.createAdminPanel();

    this.modal = modalPlugin.createModal(adminPanel);
    this.modal.close$.subscribe(() => this.dropdownContainer.style.display = "flex");
    this.modal.setOptions({ padding: "0px", borderRadius: "10px" });
  }

  private renderOpenPanel() {
    let dropdownContainer = createElement("div", ["dropdown-container"]);
    this.dropdownContainer = dropdownContainer;
    let content = createElement("div", ["content"]);
    content.textContent = "Администрирование";
    content.onclick = () => {
      this.dropdownContainer.style.display = "none";
      this.modal.open();
    };
    appendChild(dropdownContainer, content);
    appendChild(document.body, dropdownContainer);
  }

  private createAdminPanel() {
    let adminPanel = createElement("div", ["admin_panel"]);

    let selectOption = createElement("div", ["select_Option"]);
    let mainOption = createElement("div", ["main_Option"]);
    let actionButtons = createElement("div", ["actionButton"]);
    appendChild(adminPanel, selectOption);
    appendChild(adminPanel, mainOption);
    appendChild(adminPanel, actionButtons);

    let selectOptionBlockBtn1 = createElement("div", ["selectOptionBlockBtn"]);
    let selectOptionBlockBtn2 = createElement("div", ["selectOptionBlockBtn"]);
    selectOptionBlockBtn1.textContent = "Внешний вид";
    selectOptionBlockBtn2.textContent = "Действие";
    selectOptionBlockBtn1.classList.add("active");

    selectOptionBlockBtn1.onclick = () => {
      if (!selectOptionBlockBtn1.classList.contains("active")) {
        appearanceBlock.style.display = "flex";
        actionBlock.style.display = "none";
        selectOptionBlockBtn1.classList.toggle("active");
        selectOptionBlockBtn2.classList.toggle("active");
      }
    };
    selectOptionBlockBtn2.onclick = () => {
      if (!selectOptionBlockBtn2.classList.contains("active")) {
        appearanceBlock.style.display = "none";
        actionBlock.style.display = "flex";
        selectOptionBlockBtn1.classList.toggle("active");
        selectOptionBlockBtn2.classList.toggle("active");
      }
    };

    appendChild(selectOption, selectOptionBlockBtn1);
    appendChild(selectOption, selectOptionBlockBtn2);

    let appearanceBlock = createElement("div", ["option_block", "appearance"]);
    let actionBlock = createElement("div", ["option_block", "action"]);
    appendChild(mainOption, appearanceBlock);
    appendChild(mainOption, actionBlock);

    let actionBtn1 = createElement("button", ["actionBtn"]);
    let actionBtn2 = createElement("button", ["actionBtn"]);
    const form = createElement("form", ["confingForm"]);

    actionBtn1.textContent = "По умолчанию";
    actionBtn2.textContent = "Сохранить как";
    actionBtn1.onclick = () => {
      for (let i = 0; i < this.options.length; i++) {
        if (this.options[i].type === "input" || this.options[i].type === "color") {
          (this.options[i].element.children[1] as HTMLInputElement).value = this.defaultOptions[this.options[i].correspondence] as string;
        } else if (this.options[i].type === "checkBox") {
          (this.options[i].element.children[1] as HTMLInputElement).checked = Boolean(this.defaultOptions[this.options[i].correspondence]);
        } else if(this.options[i].type === "userList"){
          this.options[i].elementObject.setList(this.defaultOptions[this.options[i].correspondence])
        }
      }
      this.saveOptions();
    };
    actionBtn2.onclick = () => {
      this.saveJsonFile.bind(this)(JSON.stringify(this.toTableOptions()));
    };
    const fileInput = createElement("input", ["fileConfigInput"]) as HTMLInputElement;
    fileInput.type = "file";
    fileInput.id = "fileConfigInput";
    fileInput.accept = ".json";
    fileInput.onchange = (event) => this.loadHandler.bind(this)(event);

    const label = createElement("label", ["actionBtn"]) as HTMLLabelElement;
    label.htmlFor = "fileConfigInput";
    label.textContent = "Загрузить";
    appendChild(form, fileInput);
    appendChild(form, label);

    appendChild(actionButtons, actionBtn1);
    appendChild(actionButtons, actionBtn2);
    appendChild(actionButtons, form);
    this.renderOptions(appearanceBlock, this.appearanceOptions);
    this.renderOptions(actionBlock, this.actionOptions);
    let blockInfo = new InfoList("Список установленных плагинов", []);
    let blockInfoElement = blockInfo.createList();
    this.controller.pluginEvent$.subscribe(() => {
      let plugList: Array<string> = [];
      for (let key in this.controller.plugins) {
        if (this.controller.plugins[key] && this.controller.plugins[key].state$.getValue() !== PLUGIN_STATE.REMOVED) {
          plugList.push(this.controller.plugins[key].name);
        }
      }
      blockInfo.setList(plugList);
    });
    appendChild(actionBlock, blockInfoElement);
    return adminPanel;
  }

  private renderOptions(block: HTMLElement, options: Array<adminPanelOption>) {
    for (let i = 0; i < options.length; i++) {
      if (this.createOptionKit[options[i].type]) {
        let option = this.createOptionKit[options[i].type](options[i].options);
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
    let resultOptions: Record<string, any> = {};
    let error:Array<number> = [];
    for (let i = 0; i < this.options.length; i++) {
      let value: string | Array<string> = (this.options[i].element.children[1] as HTMLInputElement).value;
      const inputValue = value;
      const regExp = new RegExp(this.options[i].regExp);
      if (!regExp.test(inputValue)) {
        error.push(i)
        this.options[i].element.style.boxShadow = "0 0 10px red";
      } else {
        this.options[i].element.style.boxShadow = "initial";
      }
    }


    for (let i = 0; i < this.options.length; i++) {
      if(error.includes(i)) continue

      let value: string | boolean | Array<string>;
      if (this.options[i].type === "input" || this.options[i].type === "color") {
        value = (this.options[i].element.children[1] as HTMLInputElement).value;
      } else if (this.options[i].type === "checkBox") {
        value = (this.options[i].element.children[1] as HTMLInputElement).checked;
      } else if(this.options[i].type === "userList"){
        let collection = this.options[i].element.querySelectorAll('.listItem')
        value = Array.from(collection).map((item)=>item.textContent)
      }
      resultOptions[this.options[i].correspondence] = value;
    }
    return resultOptions;
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
          let jsonObject: Record<string, any>;

          if (typeof event.target.result === "string") {
            jsonObject = JSON.parse(event.target.result);
          }
          for (let key in jsonObject) {
            let input = this.options.find((item) => item.correspondence === key);
            if (input) {
              if (input.type === "color" || input.type === "input") {
                const inputElement = input.element.children[1] as HTMLInputElement;
                inputElement.value = jsonObject[key];
              } else if (input.type === "checkBox") {
                const inputElement = input.element.children[1] as HTMLInputElement;
                inputElement.checked = jsonObject[key];
              } else if(input.type === "userList"){
                input.elementObject.setList(jsonObject[key])
              }
              console.log(jsonObject[key])
            }
          }
          this.saveOptions()


        } catch (error) {
          this.controller.error$.next(`Ошибка при разборе JSON: ${error}`);
        }
      };

      reader.readAsText(file);
    } else {
      this.controller.error$.next("Файл не выбран");
    }
    fileInput.value = ""
  }

  unRegister() {
    this.state$.next(PLUGIN_STATE.REMOVED);
  }
}