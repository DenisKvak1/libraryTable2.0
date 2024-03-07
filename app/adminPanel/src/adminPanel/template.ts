export let adminPanelTemplate = `
  <div class="admin_panel">
    <div class="select_Option">
      <button class="selectOptionBlockBtn">Внешний вид</button>
      <button class="selectOptionBlockBtn noneActive">Действие</button>
    </div>
    <div class="main_Option">
       <div class="option_block appearance">

      </div>
      <div class="option_block action">

      </div>
    </div>
    <div class="actionButton">
      <button class="actionBtn">По умолчанию</button>
      <button class="actionBtn">Сохранить</button>
      <form class="confingForm">
        <input type="file" id="fileConfigInput" class="fileConfigInput" accept=".json" />
        <label for="fileConfigInput" class="actionBtn">Загрузить</label>
      </form>
    </div>
  </div>
`;

export let adminPanelOptionInput = `
  <div class="input_option">
    <span></span>
    <input>
  </div>
`;
export let adminPanelOptionColor = `
  <div class="input_option">
    <span></span>
    <input>
  </div>
`;
export let adminPanelOptionCheckBox = `
  <div class="checkBox_option">
    <span></span>
    <input class="checkBox_optionInput" type="checkbox">
  </div>
`;


export let adminPanelDropdown = `
    <div class="dropdown-container">
        <div class="content">Администрирование</div>
    </div>
`