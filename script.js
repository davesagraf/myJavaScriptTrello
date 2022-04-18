//trello board
const columnsContainer = document.querySelector(".board");
//add column button
const addListButton = document.querySelector(".add-list");
//all tasks array
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//all columns array
let columns = JSON.parse(localStorage.getItem("columns")) || [];

//column object
const eachNewColumn = function () {
  this.id = new Date().getTime();
  this.title = "";
  this.content = "";
};

//card object
const eachNewCard = function () {
  this.id = new Date().getTime();
  this.title = "";
  this.content = "";
  this.column_id = "";
  this.created_at = new Date().toDateString();
  this.comments = []
};

//open form input
const activateForm = (form, button) => {
  showHideForm(form, button);
  const input = form.querySelector(".form-input");
  input.focus();

  form.addEventListener("submit", submitForm);
  form.addEventListener("click", closeForm);

  function submitForm(e) {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    //form state for New Card
    if (form.classList.contains("new-card")) {
      const list = button.parentElement;

      const newTaskInput = list.querySelector(".new-card-title");

      const newTask = new eachNewCard();

      newTask.title = newTaskInput.value;

      const currentColumnId = list.getAttribute("id");

      newTask.column_id = currentColumnId;

      createCard(newTask, list);

      tasks.push(newTask);
      saveCards(tasks);

      newTaskInput.value = "";
    }
    //form state for New Column
    else if (form.classList.contains("new-list")) {
      const newColumnInput = document.querySelector("#new-list-title");

      const newColumn = new eachNewColumn();

      newColumn.title = newColumnInput.value;

      newColumn.content = "";

      createList(newColumn);

      columns.push(newColumn);
      saveColumns(columns);

      newColumnInput.value = "";
    }
    //remove form event listeners & clear input
    showHideForm(form, button);
    input.value = "";
    form.removeEventListener("submit", submitForm);
    form.removeEventListener("click", closeForm);
  }
  //close form
  function closeForm(e) {
    if (!e.target.closest(".cancel")) return;
    showHideForm(form, button);
    input.value = "";
    form.removeEventListener("submit", submitForm);
    form.removeEventListener("click", closeForm);
  }
};

/**
 * Show or hide form according to classes
 * @param {HTMLElement} form element to be shown/hidden
 * @param {HTMLElement} button element to be shown/hidden
 */

//toggle input classes
const showHideForm = (form, button) => {
  const formContainer = form.parentElement;
  if (formContainer.classList.contains("hidden")) {
    formContainer.classList.remove("hidden");
    button.classList.add("hidden");
  } else {
    formContainer.classList.add("hidden");
    button.classList.remove("hidden");
  }
};

//create column function
const createList = (column) => {
  const newList = document.createElement("ul");
  newList.classList.add("list");
  newList.setAttribute("id", `${column.id}`);
  newList.innerHTML = `
    <div class="list-header">
      <p class="list-title">${column.title}</p>
      <button class="delete-list">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
    <li class="add-card">
      <a href="#">
        <img class="plus-icon" src="images/plus.svg" alt="Plus sign">
        Add another card
      </a>
    </li>
    <li class="form-container hidden">
      <form action="#" class="new-card">
        <textarea name="new-card-title" id="${column.id}" rows="3"
        placeholder="Enter a title for this card..." class="form-input new-card-title"></textarea>
        <div class="form-buttons">
          <button type="submit" class="submit">Add card</button>
          <button class="cancel">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </form>
    </li>
  `;

  const board = document.querySelector(".board");
  board.insertBefore(newList, addListButton);

  // Listen delete-button and delete list on click
  const deleteListButton = newList.querySelector(".delete-list");
  deleteListButton.addEventListener("click", (e) => {
    const list = e.target.closest(".list");
    const listId = list.getAttribute("id");
    const data = listId;
    const cards = list.querySelectorAll(".card");
    cards.forEach((c) => {
      const cardId = c.getAttribute("data-columnid");

      for (let t = 0; t < tasks.length; t++) {
        if (tasks[t].column_id == cardId) {
          {
            tasks.splice(t, 1);
            saveCards(tasks);
            getCards();
          }
        }
      }
    });

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].id == data) {
        columns.splice(i, 1);
        saveColumns(columns);
        getColumns();
        break;
      }
    }
    list.remove(), { once: true };
    e.stopPropagation();
  });

  // Listen add-card button and call activateForm() on click
  const addCardButton = newList.querySelector(".add-card");
  addCardButton.addEventListener("click", (_) => {
    const form = newList.querySelector(".new-card");
    activateForm(form, addCardButton);
  });
};

/**
 * Creates a new card on the list
 * @param {HTMLElement} list element where the new card is added
 * @param {String} title of the new card
 */

//create card function
const createCard = (task) => {
  const newCard = document.createElement("li");
  newCard.classList.add("card");
  newCard.setAttribute("id", `${task.id}`);
  newCard.setAttribute("data-columnid", `${task.column_id}`);
  newCard.innerHTML = `
  <div class="card-header">
  <div class="card-title">${task.title}</div>
</div>

<div class="dropdown closed">
  <h4 class="icon"><span>...</span></h4>
  <div class="menu">
    <div class="edit-card">
      <button class="edit-card" id="card-dd-edit">
        <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
          <path
            d="M 18.414062 2 C 18.158062 2 17.902031 2.0979687 17.707031 2.2929688 L 15.707031 4.2929688 L 14.292969 5.7070312 L 3 17 L 3 21 L 7 21 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.926094 2.0979687 18.670063 2 18.414062 2 z M 18.414062 4.4140625 L 19.585938 5.5859375 L 18.292969 6.8789062 L 17.121094 5.7070312 L 18.414062 4.4140625 z M 15.707031 7.1210938 L 16.878906 8.2929688 L 6.171875 19 L 5 19 L 5 17.828125 L 15.707031 7.1210938 z">
          </path>
        </svg>
      </button>
    </div>
    <div class="delete-card">
      <button class="delete-card" id="card-dd-delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</div>`;

  //current column elements
  const list = document.getElementById(`${task.column_id}`);
  const thisColumnId = list.getAttribute("id");
  let listTitle = list.querySelector(".list-title").textContent;
  const listTitleDiv = list.querySelector(".list-title");

  //change current column title
  listTitleDiv.addEventListener("click", (e) => {
    listTitleDiv.setAttribute("contenteditable", true);
    listTitleDiv.setAttribute("type", "input");
    listTitleDiv.addEventListener("input", updateColumnTitle);
  });

  function updateColumnTitle(e) {
    let thisColumnTitle = listTitleDiv.textContent;
    const specifiedElement = listTitleDiv

    document.addEventListener("click", (e) => {
      const isClickInside = specifiedElement.contains(e.target);

      if (!isClickInside) {
        const columnsArray = columns;
        const columnValues = columnsArray.values();

        for (const columnValue of columnValues) {
          if (columnValue.id == thisColumnId) {
            columnValue.title = thisColumnTitle;
            listTitle = thisColumnTitle;
            saveColumns(columns);
          }
        }
      }
    });
  }

  //add another card to column
  const addNextCardButton = list.querySelector(".add-card");
  list.insertBefore(newCard, addNextCardButton);

  //card dropdown menu
  const dropDownCards = document.querySelectorAll(".dropdown");

  dropDownCards.forEach((dropDownCard) => {
    dropDownCard.addEventListener("pointerdown", (e) => {
      e.preventDefault()    
      e.stopPropagation()
      if (dropDownCard.classList.contains("closed")) {
        dropDownCard.classList.remove("closed");
        dropDownCard.style.zIndex = "1";

        //edit card
        const editCardButton = dropDownCard.querySelector("#card-dd-edit");
        const currentCard = editCardButton.parentElement.parentElement.parentElement.parentElement;
        const currentCardId = currentCard.getAttribute("id");
        editCardButton.addEventListener("click", (e) => {
          const modal = document.querySelector("#modal");
          modal.classList.add("open");
          modal.innerHTML = `<div class="create-task-modal-header-row">
    <div class="create-task-modal-title">
      <h2>${task.title}</h2>
    </div>
    <div class="ct-close">
      <button class="ct-close-button" id="close-modal-btn" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    </div>
  </div>
  <div class="create-task-status-row">
    <h4>in column: ${listTitle}</h4>
  </div>
  <div class="create-task-items-titles-row">
    <div class="create-task-created-at">
      <h3>CREATED AT</h3>
    </div>
    <div class="create-task-actions">
      <h3>ACTIONS</h3>
    </div>
    <div class="create-task-labels">
      <h3>LABELS</h3>
    </div>
  </div>
  <div class="create-task-items-row">
    <div class="create-task-items-date">
      <h3>${task.created_at}</h3>
    </div>
    <div class="create-task-items-action">
      <button class="create-task-items-action-button" type="button">
        Archive Card
      </button>
    </div>
    <div class="create-task-items-plus-div">
      <button class="create-task-items-plus-button" type="button">
        +
      </button>
    </div>
  </div>
  <div class="create-task-desc-title-row">
    <h2>DESCRIPTION</h2>
  </div>
  <div class="create-task-desc-div">
    <input
      class="create-task-desc-input"
      type="text"
      placeholder="Add a more detailed description"
    />
  </div>
  <div class="create-task-attachments-title-row">
    <h2>ATTACHMENTS</h2>
  </div>
  <button class="create-task-attachments-button" type="button">
    Add an attachment
  </button>
  <div class="create-task-checklist-title-row">
    <h2>CHECKLIST</h2>
  </div>
  <button class="create-task-add-checklist-button">Add an item</button>
  <div class="create-task-activity-title-row">
    <h2>ACTIVITY</h2>
  </div>
  <div class="create-task-comments-div">
    <input
      class="create-task-comments-input"
      type="text"
      placeholder="Write a comment"
    />
  </div>
  <div class="create-task-save-cancel-buttons-row">
    <div class="create-task-save-button-div">
      <button class="create-task-save-button" type="button">SAVE</button>
    </div>
    <div class="create-task-cancel-button-div">
      <button class="create-task-cancel-button" type="button">CANCEL</button>
    </div>
  </div>`;
          const overlay = document.querySelector("#overlay");
          overlay.classList.add("open");

          const taskTitle = document.querySelector(".create-task-modal-title");

          taskTitle.addEventListener("click", (e) => {
            taskTitle.setAttribute("contenteditable", true);
            taskTitle.setAttribute("type", "input");
            taskTitle.addEventListener("input", updateTaskTitle);
          });

          function updateTaskTitle(e) {
            const taskNewTitle = taskTitle.textContent;
            const tasksArray = tasks;
            const taskValues = tasksArray.values();

            for (const taskValue of taskValues) {
              if (taskValue.id == currentCardId) {
                taskValue.title = taskNewTitle;
                saveCards(tasks);
              }
            }
          }

          //task description
          const cardDescInput = document.querySelector(".create-task-desc-input");
          cardDescInput.value = `${task.content}`;

          cardDescInput.addEventListener("click", (e) => {
            cardDescInput.addEventListener("input", updateTaskDescription);
          });

          function updateTaskDescription(e) {
            const taskNewDescription = cardDescInput.value;
            const tasksArray = tasks;
            const taskValues = tasksArray.values();

            for (const taskValue of taskValues) {
              if (taskValue.id == currentCardId) {
                taskValue.content = taskNewDescription;
                saveCards(tasks);
              }
            }
          }

          //task comments 
          const cardComments = document.querySelector('.create-task-comments-input')

          cardComments.addEventListener("click", (e) => {
            saveCardButton.addEventListener("click", (e) => {
              const newComment = document.createElement("div");
              newComment.classList.add("card-comments");
    
              newComment.textContent = cardComments.value;
              task.comments.push(cardComments.value);
              modal.append(newComment);
              saveCards(tasks);
              cardComments.value = "";
            });
          })

          //save edit
          const saveCardButton = document.querySelector(".create-task-save-button");
          saveCardButton.addEventListener("click", (e) => {
            let cardTitle = currentCard.querySelector(".card-title");

            const tasksArray = tasks;
            const taskValues = tasksArray.values();

            for (const taskValue of taskValues) {
              if (taskValue.id == currentCardId) {
                cardTitle.textContent = taskValue.title;
                saveCards(tasks);
              }
            }
          });

          //cancel edit
          const cancelEditCardButton = document.querySelector(".create-task-cancel-button");
          cancelEditCardButton.addEventListener("click", closeModal);

          const closeModalButton = document.querySelector("#close-modal-btn");

          closeModalButton.addEventListener("click", closeModal);

          overlay.addEventListener("click", closeModal);

          e.stopPropagation();
        });

        //archive card
        document.addEventListener("click", (e) => {
          let thisCard = dropDownCard.parentNode
          let thisCardId = thisCard.getAttribute('id')
          if (e.target.classList.contains("create-task-items-action-button")) {
            for (let i = 0; i < tasks.length; i++) {
              if (tasks[i].id == thisCardId) {
                tasks.splice(i, 1);
                saveCards(tasks);
                break;
              }
            }
            thisCard.remove(), { once: true };
            closeModal()
            e.stopPropagation();
          }
        })

        //delete card
        const deleteCardButton = dropDownCard.querySelector("#card-dd-delete");
        deleteCardButton.addEventListener("click", (e) => {
          const card = e.target.closest(".card");
          const cardId = card.closest("[id]").getAttribute("id");

          for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].id == cardId) {
              tasks.splice(i, 1);
              saveCards(tasks);
              break;
            }
          }
          card.remove(), { once: true };
          e.stopPropagation();
        });
      }
      e.stopPropagation()
    });

    dropDownCard.addEventListener("mouseleave", (e) => {
      if (!dropDownCard.classList.contains("closed")) {
        dropDownCard.classList.add("closed");
        dropDownCard.style.zIndex = "0"
      }
    });
  });

  //add drag'n'drop to new card
  dragDropCard(newCard);
};

/**
 * Adds drag and drop functionalities to card
 * @param {HTMLElement} card element that can be dragged & dropped
 */

//dragNdrop function
const dragDropCard = (card) => {
  card.addEventListener("pointerdown", (e) => {
    // e.preventDefault();

    if (e.target.closest(".delete-card")) {
      return;
    } else if (e.target.closest(".edit-card")) {
      return;
    }

    //get dragged card ID & its initial column ID
    const cardInitialColumnId = card.getAttribute("data-columnid");
    const cardId = card.getAttribute("id");
    //

    const cardRect = card.getBoundingClientRect();

    // Create preview
    const preview = card.cloneNode();
    preview.classList.add("preview");
    preview.style.height = `${cardRect.height}px`;
    card.before(preview);

    // Prepare card for dragging
    document.body.append(card);
    card.dataset.dragging = "true";
    card.style.left = `${cardRect.left}px`;
    card.style.top = `${cardRect.top}px`;
    card.style.width = `${cardRect.width}px`;
    // card.style.height = `${cardRect.height}px`;

    card.setPointerCapture(e.pointerId);
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", up);

    function move(e) {
      const left = parseFloat(card.style.left);
      const top = parseFloat(card.style.top);
      card.style.left = `${left + e.movementX}px`;
      card.style.top = `${top + e.movementY}px`;
      card.style.border = "solid 1px #0079BF";

      const currentPosition = document.elementFromPoint(left, top);
      const list = currentPosition.closest(".list");
      if (!list) return;

      const previewExists = [...list.children].find((el) => el === preview);
      if (!previewExists) {
        const addCardButton = list.querySelector(".add-card");
        list.insertBefore(preview, addCardButton);
      }

      const cards = [...list.querySelectorAll(".card")];
      const cardPositions = cards.map((card) => card.getBoundingClientRect());
      const cardPosition = cardPositions.findIndex((pos) => {
        return (
          pos.left < left &&
          left < pos.right &&
          pos.top < top &&
          top < pos.bottom
        );
      });

      if (cardPosition === -1) return;
      const cardElement = cards[cardPosition];
      const previewPosition = cards.findIndex((card) => card === preview);

      if (cardPosition > previewPosition) {
        cardElement.after(preview);
      } else {
        cardElement.before(preview);
      }
    }

    function up(e) {
      card.dataset.dragging = "false";
      card.releasePointerCapture(e.pointerId);
      preview.before(card);
      preview.remove();
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerup", up);

      //get current column id on drag end

      const currentColumn = card.parentElement;
      const currentColumnId = currentColumn.getAttribute("id");
      card.dataset.columnid = currentColumnId;

      const tasksArray = tasks;
      const taskValues = tasksArray.values();

      for (const taskValue of taskValues) {
        if (
          taskValue.id == cardId &&
          taskValue.column_id == cardInitialColumnId
        ) {
          taskValue.column_id = currentColumnId;
          saveCards(tasks);
        }
      }
    }
    e.stopPropagation();
  });
};
//add column button global listener
addListButton.addEventListener("click", (e) => {
  const button = e.currentTarget;
  const form = document.querySelector(".new-list");
  activateForm(form, button);
});
//get columns on reload
function getColumns() {
  return JSON.parse(localStorage.getItem("columns") || "[]");
}
//render columns on reload
getColumns().forEach((column) => {
  createList(column);
});
//get cards on reload
function getCards() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}
//render cards on reload
getCards().forEach((task) => {
  createCard(task);
});
//save columns after most actions
function saveColumns(columns) {
  localStorage.setItem("columns", JSON.stringify(columns));
}
//save cards after most actions
function saveCards(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
//close edit card modal [for all cards]
function closeModal() {
  modal.classList.remove("open");
  overlay.classList.remove("open");
}
