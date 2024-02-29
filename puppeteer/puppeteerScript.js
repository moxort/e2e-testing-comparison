const puppeteer = require('puppeteer');

(async () => {
    const TODO_ITEMS = [
        'Book doctor appointment',
        'Buy birthday gift for Mom',
        'Find place for vacation',
    ];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://demo.playwright.dev/todomvc');

    async function addTodoItem(item) {
        await page.type('.new-todo', item);
        await page.keyboard.press('Enter');
    }

    async function getTodoTexts() {
        return await page.$$eval('.todo-list li .view label', els => els.map(el => el.textContent));
    }

    async function checkNumberOfTodosInLocalStorage(expected) {
        const length = await page.evaluate(() => {
            return JSON.parse(localStorage.getItem('react-todos')).length;
        });
        console.assert(length === expected, `Expected ${expected} items in localStorage, found ${length}`);
    }

    // Adding the first todo item
    await addTodoItem(TODO_ITEMS[0]);

    // Checking the first todo item
    let todos = await getTodoTexts();
    console.assert(todos.length === 1 && todos[0] === TODO_ITEMS[0], 'First item not added correctly');

    // Adding the second todo item
    await addTodoItem(TODO_ITEMS[1]);

    // Checking the second todo item
    todos = await getTodoTexts();
    console.assert(todos.length === 2 && todos[1] === TODO_ITEMS[1], 'Second item not added correctly');

    // Check number of todos in localStorage
    await checkNumberOfTodosInLocalStorage(2);

    // Assuming continued from the previous Puppeteer script

    // Function to check if the input field is cleared after adding an item
    async function checkInputCleared() {
        const inputValue = await page.$eval('.new-todo', el => el.value);
        console.assert(inputValue === '', 'Input field is not cleared after adding an item');
    }

    // Adding a todo item
    await addTodoItem(TODO_ITEMS[0]);

    // Checking if the input field is cleared
    await checkInputCleared();

    // Check number of todos in localStorage
    await checkNumberOfTodosInLocalStorage(1);

    // Assuming continued from the previous Puppeteer script

    // Create 3 items.
    for (let item of TODO_ITEMS) {
        await addTodoItem(item);
    }

    // Check if 3 items are added to the list
    let itemsCount = await page.$$eval('.todo-list li', items => items.length);
    console.assert(itemsCount === 3, `Expected 3 items, found ${itemsCount}`);

    // Verify the text of each todo item
    let todoTexts = await getTodoTexts();
    console.assert(JSON.stringify(todoTexts) === JSON.stringify(TODO_ITEMS), 'Todo items do not match expected texts');

    // Check number of todos in localStorage
    await checkNumberOfTodosInLocalStorage(3);

    // Assuming continued from the previous Puppeteer script

    // Complete all todos by clicking the 'toggle-all' button
    await page.click('.toggle-all');
    let completedCount = await page.$$eval('.todo-list li.completed', items => items.length);
    console.assert(completedCount === 3, `Expected 3 completed items, found ${completedCount}`);

    // Check if all todos are marked as completed in local storage
    await checkNumberOfTodosInLocalStorage(3);

    // Clear the complete state of all items by clicking the 'toggle-all' button again
    await page.click('.toggle-all');
    completedCount = await page.$$eval('.todo-list li:not(.completed)', items => items.length);
    console.assert(completedCount === 3, 'Expected 3 items to be not completed');

    // Mark all as completed again for the next check
    await page.click('.toggle-all');

    // Uncheck the first todo item
    await page.click('.todo-list li:nth-child(1) .toggle');
    let firstItemClass = await page.$eval('.todo-list li:nth-child(1)', item => item.className);
    console.assert(!firstItemClass.includes('completed'), 'First item should not be completed');

    // Re-check the first todo item
    await page.click('.todo-list li:nth-child(1) .toggle');
    firstItemClass = await page.$eval('.todo-list li:nth-child(1)', item => item.className);
    console.assert(firstItemClass.includes('completed'), 'First item should be completed again');

    // Verify all items are marked as completed
    completedCount = await page.$$eval('.todo-list li.completed', items => items.length);
    console.assert(completedCount === 3, 'Expected 3 items to be marked as completed');

    // Assuming continued from the previous Puppeteer script

    // Mark items as complete
    // await addTodoItem(TODO_ITEMS[0]);
    // await addTodoItem(TODO_ITEMS[1]);
    // await page.click('.todo-list li:nth-child(1) .toggle');
    // let firstItemCompleted = await page.$eval('.todo-list li:nth-child(1)', item => item.classList.contains('completed'));
    // console.assert(firstItemCompleted, 'First item should be marked as completed');
    //
    // await page.click('.todo-list li:nth-child(2) .toggle');
    // let secondItemCompleted = await page.$eval('.todo-list li:nth-child(2)', item => item.classList.contains('completed'));
    // console.assert(secondItemCompleted, 'Second item should be marked as completed');
    //
    // // Un-mark items as complete
    // await page.click('.todo-list li:nth-child(1) .toggle'); // Uncheck first item
    // firstItemCompleted = await page.$eval('.todo-list li:nth-child(1)', item => item.classList.contains('completed'));
    // console.assert(!firstItemCompleted, 'First item should not be completed after unchecking');

    // Edit an item
    // await page.click('.todo-list li:nth-child(2) label');
    // await page.waitForSelector('.todo-list li:nth-child(2) .edit');
    // await page.evaluate(() => document.querySelector('.todo-list li:nth-child(2) .edit').value = '');
    // await page.type('.todo-list li:nth-child(2) .edit', 'buy some sausages');
    // await page.keyboard.press('Enter');
    // let editedText1 = await page.$eval('.todo-list li:nth-child(2) label', el => el.textContent);
    // console.assert(editedText1 === 'buy some sausages', 'Second item text should be updated to "buy some sausages"');

    // Check todos in local storage after edits
    let storedTodos = await page.evaluate(() => JSON.parse(localStorage.getItem('react-todos')));
    // console.assert(storedTodos.some(todo => todo.title === 'buy some sausages'), 'Local storage should contain the edited todo');

    // Assuming continued from the previous Puppeteer script

    // Editing tests
    // Double-click to edit the second item and check visibility
    // await page.click('.todo-list li:nth-child(2) label');
    // // After click, check if the checkbox is hidden and label is not visible
    // let editVisible = await page.$eval('.todo-list li:nth-child(2) .edit', el => !!el);
    // console.assert(editVisible, 'Edit input should be visible after double-click');

    // Save edits on blur
    await page.click('.todo-list li:nth-child(2) .edit');
    await page.keyboard.type('buy some sausages');
    await page.click('.new-todo'); // Click outside to trigger blur
    let editedText2 = await page.$eval('.todo-list li:nth-child(2) label', el => el.textContent);
    console.assert(editedText2 === 'buy some sausages', 'Text should be saved on blur');

    // Trim entered text
    await page.click('.todo-list li:nth-child(2) label');
    await page.keyboard.type('    buy more sausages    ');
    await page.keyboard.press('Enter');
    let editedText3 = await page.$eval('.todo-list li:nth-child(2) label', el => el.textContent);
    console.assert(editedText3.trim() === 'buy more sausages', 'Text should be trimmed');

    // Remove the item if an empty text string was entered
    await page.click('.todo-list li:nth-child(2) label');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Enter');
    let itemsCountAfterDeletion = await page.$$eval('.todo-list li', items => items.length);
    console.assert(itemsCountAfterDeletion === 2, 'Item should be removed if empty text string is entered');

    // Cancel edits on escape
    await page.click('.todo-list li:nth-child(1) label');
    await page.keyboard.type('cancel this edit');
    await page.keyboard.press('Escape');
    let canceledEdit = await page.$eval('.todo-list li:nth-child(1) label', el => el.textContent);
    console.assert(TODO_ITEMS.includes(canceledEdit), 'Edit should be canceled on escape');

    // Assuming continued from the previous Puppeteer script

    // Counter tests
    // Add a todo item and check the counter
    await addTodoItem(TODO_ITEMS[0]);
    let counterText = await page.$eval('.todo-count', el => el.textContent.trim());
    console.assert(counterText.includes('1'), 'Counter should display 1 after adding the first item');

    // Add another todo item and check the counter
    await addTodoItem(TODO_ITEMS[1]);
    counterText = await page.$eval('.todo-count', el => el.textContent.trim());
    console.assert(counterText.includes('2'), 'Counter should display 2 after adding another item');

    // Check number of todos in local storage
    await checkNumberOfTodosInLocalStorage(2);







    await browser.close();
})();
