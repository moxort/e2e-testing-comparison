const puppeteer = require('puppeteer');

let browser;
let page;

beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
});

afterAll(async () => {
    await browser.close();
});

const TODO_ITEMS = [
    'Book doctor appointment',
    'Buy birthday gift for Mom',
    'Find place for vacation'
];

async function createDefaultTodos() {
    for (const item of TODO_ITEMS) {
        await page.type('.new-todo', item);
        await page.keyboard.press('Enter');
    }
}

async function checkNumberOfTodosInLocalStorage(expected) {
    const length = await page.evaluate(expected => {
        return JSON.parse(localStorage.getItem('react-todos')).length;
    }, expected);
    return length === expected;
}

describe('New Todo', () => {
    beforeEach(async () => {
        await page.goto('https://demo.playwright.dev/todomvc');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should allow me to add todo items', async () => {
        await page.type('.new-todo', TODO_ITEMS[0]);
        await page.keyboard.press('Enter');

        const todoText = await page.evaluate(() => document.querySelector('.todo-list label').textContent);
        expect(todoText).toBe(TODO_ITEMS[0]);

        await page.type('.new-todo', TODO_ITEMS[1]);
        await page.keyboard.press('Enter');

        const todos = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list label')).map(el => el.textContent));
        expect(todos).toEqual([TODO_ITEMS[0], TODO_ITEMS[1]]);

        const todosCount = await checkNumberOfTodosInLocalStorage(2);
        expect(todosCount).toBeTruthy();
    });

    test('should clear text input field when an item is added', async () => {
        await page.type('.new-todo', TODO_ITEMS[0]);
        await page.keyboard.press('Enter');

        const inputValue = await page.evaluate(() => document.querySelector('.new-todo').value);
        expect(inputValue).toBe('');

        const todosCount = await checkNumberOfTodosInLocalStorage(1);
        expect(todosCount).toBeTruthy();
    });

    test('should append new items to the bottom of the list', async () => {
        await createDefaultTodos();

        const todos = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list label')).map(el => el.textContent));
        expect(todos).toEqual(TODO_ITEMS);

        const todosCount = await checkNumberOfTodosInLocalStorage(3);
        expect(todosCount).toBeTruthy();
    });
});

describe('Mark all as completed', () => {
    beforeEach(async () => {
        await page.goto('https://demo.playwright.dev/todomvc');
        await page.evaluate(() => {
            localStorage.clear();
        });
        await createDefaultTodos();
        const todosCount = await checkNumberOfTodosInLocalStorage(3);
        expect(todosCount).toBeTruthy();
    });

    afterEach(async () => {
        const todosCount = await checkNumberOfTodosInLocalStorage(3);
        expect(todosCount).toBeTruthy();
    });

    test('should allow me to mark all items as completed', async () => {
        await page.click('input.toggle-all'); // Assuming 'toggle-all' is the checkbox to mark all todos completed
        const completedCount = await checkNumberOfCompletedTodosInLocalStorage(3);
        expect(completedCount).toBeTruthy();

        const classList = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list li'), e => e.className));
        expect(classList.every(className => className.includes('completed'))).toBe(true);
    });

    test('should allow me to clear the complete state of all items', async () => {
        await page.click('input.toggle-all'); // Check all todos
        await page.click('input.toggle-all'); // Uncheck all todos

        const classList = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list li'), e => e.className));
        expect(classList.every(className => className === '')).toBe(true);
    });

    test('complete all checkbox should update state when items are completed / cleared', async () => {
        await page.click('input.toggle-all'); // Check all todos

        let isChecked = await page.evaluate(() => document.querySelector('input.toggle-all').checked);
        expect(isChecked).toBe(true);

        // Uncheck the first todo
        await page.click('.todo-list li:first-child .toggle');
        isChecked = await page.evaluate(() => document.querySelector('input.toggle-all').checked);
        expect(isChecked).toBe(false);

        // Check the first todo again
        await page.click('.todo-list li:first-child .toggle');
        const completedCount = await checkNumberOfCompletedTodosInLocalStorage(3);
        expect(completedCount).toBeTruthy();

        isChecked = await page.evaluate(() => document.querySelector('input.toggle-all').checked);
        expect(isChecked).toBe(true);
    });
});

async function checkNumberOfCompletedTodosInLocalStorage(expected) {
    const completed = await page.evaluate(expected => {
        return JSON.parse(localStorage.getItem('react-todos')).filter(todo => todo.completed).length;
    }, expected);
    return completed === expected;
}

describe('Item', () => {
    beforeEach(async () => {
        await page.goto('https://demo.playwright.dev/todomvc');
        await page.evaluate(() => {
            localStorage.clear();
        });
        await createDefaultTodos();
    });

    test('should allow me to mark items as complete', async () => {
        // Check first item.
        await page.click('.todo-list li:nth-child(1) .toggle'); // Assumes '.toggle' is the checkbox class
        let classList = await page.evaluate(() => document.querySelector('.todo-list li:nth-child(1)').className);
        expect(classList).toContain('completed');

        // Check second item.
        await page.click('.todo-list li:nth-child(2) .toggle');
        classList = await page.evaluate(() => document.querySelector('.todo-list li:nth-child(2)').className);
        expect(classList).toContain('completed');
    });

    test('should allow me to un-mark items as complete', async () => {
        // Check first item
        await page.click('.todo-list li:nth-child(1) .toggle');

        // Uncheck first item
        await page.click('.todo-list li:nth-child(1) .toggle');

        let isCompleted = await page.evaluate(() => {
            const todo = document.querySelector('.todo-list li:nth-child(1) .toggle');
            return todo.checked;
        });
        expect(isCompleted).toBe(false);

        const completedCount = await checkNumberOfCompletedTodosInLocalStorage(0);
        expect(completedCount).toBeTruthy();
    });

    test('should allow me to edit an item', async () => {
        // Double-click on second todo item to trigger edit mode
        await page.click('.todo-list li:nth-child(2) label', { clickCount: 2 });

        // Fill the input with new text and press Enter
        await page.focus('.todo-list li:nth-child(2) .edit');
        await page.keyboard.type(' buy some sausages');
        await page.keyboard.press('Enter');

        // Check the new text value
        const text = await page.evaluate(() => document.querySelector('.todo-list li:nth-child(2) label').textContent);
        expect(text).toContain('buy some sausages');

        const isStored = await checkTodosInLocalStorage('buy some sausages');
        expect(isStored).toBeTruthy();
    });
});

async function checkTodosInLocalStorage(title) {
    const isStored = await page.evaluate(title => {
        const todos = JSON.parse(localStorage.getItem('react-todos'));
        return todos.some(todo => todo.title.includes(title));
    }, title);
    return isStored;
}

describe('Editing', () => {
    beforeEach(async () => {
        await page.goto('https://demo.playwright.dev/todomvc');
        await page.evaluate(() => {
            localStorage.clear();
        });
        await createDefaultTodos();
        const todosCount = await checkNumberOfTodosInLocalStorage(3);
        expect(todosCount).toBeTruthy();
    });

    test('should hide other controls when editing', async () => {
        // Double-click on second todo item to trigger edit mode
        await page.click('.todo-list li:nth-child(2) label', { clickCount: 2 });

        const styles = await page.evaluate(() => {
            const todo = document.querySelector('.todo-list li:nth-child(2) .edit');
            return {
                display: window.getComputedStyle(todo).display,
                visibility: window.getComputedStyle(todo).visibility
            };
        });
        expect(styles.display).not.toBe('none');
        expect(styles.visibility).toBe('visible');
    });

    test('should save edits on blur', async () => {
        // Double-click on second todo item to trigger edit mode
        await page.click('.todo-list li:nth-child(2) label', { clickCount: 2 });
        await page.type('.todo-list li:nth-child(2) .edit', 'buy some sausages');
        // Trigger blur by clicking on another element
        await page.click('.new-todo');

        const text = await page.evaluate(() => document.querySelector('.todo-list li:nth-child(2) label').textContent);
        expect(text).toContain('buy some sausages');
    });

    test('should trim entered text', async () => {
        // Double-click on second todo item to trigger edit mode
        await page.click('.todo-list li:nth-child(2) label', { clickCount: 2 });
        await page.type('.todo-list li:nth-child(2) .edit', '    buy some sausages    ');
        await page.keyboard.press('Enter');

        const text = await page.evaluate(() => document.querySelector('.todo-list li:nth-child(2) label').textContent);
        expect(text).toBe('buy some sausages');
    });

    test('should remove the item if an empty text string was entered', async () => {
        // Double-click on second todo item to trigger edit mode
        await page.click('.todo-list li:nth-child(2) label', { clickCount: 2 });
        await page.type('.todo-list li:nth-child(2) .edit', '');
        await page.keyboard.press('Enter');

        const items = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list li')).map(el => el.textContent.trim()));
        expect(items).toEqual([TODO_ITEMS[0], TODO_ITEMS[2]]);
    });

    test('should cancel edits on escape', async () => {
        // Double-click on second todo item to trigger edit mode
        await page.click('.todo-list li:nth-child(2) label', { clickCount: 2 });
        await page.type('.todo-list li:nth-child(2) .edit', 'buy some sausages');
        await page.keyboard.press('Escape');

        const items = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list li')).map(el => el.textContent.trim()));
        expect(items).toEqual(TODO_ITEMS);
    });
});

describe('Counter', () => {
    beforeEach(async () => {
        await page.goto('https://demo.playwright.dev/todomvc');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should display the current number of todo items', async () => {
        // Fill the new todo input and press Enter
        await page.type('.new-todo', TODO_ITEMS[0]);
        await page.keyboard.press('Enter');

        // Check if the counter displays "1 item left"
        let countText = await page.evaluate(() => document.querySelector('.todo-count').textContent);
        expect(countText.trim()).toContain('1 item left'); // Adjust text based on actual content, e.g., if it says "1 item left"

        // Fill the new todo input again and press Enter
        await page.type('.new-todo', TODO_ITEMS[1]);
        await page.keyboard.press('Enter');

        // Check if the counter updates to "2 items left"
        countText = await page.evaluate(() => document.querySelector('.todo-count').textContent);
        expect(countText.trim()).toContain('2 items left'); // Adjust text based on actual content

        // Optionally, check the number of todos in local storage
        const todosCount = await checkNumberOfTodosInLocalStorage(2);
        expect(todosCount).toBeTruthy();
    });
});

describe('Clear completed button', () => {
    beforeEach(async () => {
        await page.goto('https://demo.playwright.dev/todomvc');
        await page.evaluate(() => {
            localStorage.clear();
        });
        await createDefaultTodos();
    });

    test('should display the correct text', async () => {
        // Check the first todo item to mark it as completed
        await page.click('.todo-list li:first-child .toggle');

        // Check visibility of the 'Clear completed' button
        const isVisible = await page.evaluate(() => {
            const btn = document.querySelector('.clear-completed');
            return !!btn && window.getComputedStyle(btn).display !== 'none';
        });
        expect(isVisible).toBe(true);
    });

    test('should remove completed items when clicked', async () => {
        // Check the second todo item to mark it as completed
        await page.click('.todo-list li:nth-child(2) .toggle');

        // Click the 'Clear completed' button
        await page.click('.clear-completed');

        // Check the remaining items in the list
        const items = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.todo-list li')).map(el => el.textContent.trim());
        });
        expect(items.length).toBe(2);
        expect(items).toEqual(expect.arrayContaining([TODO_ITEMS[0], TODO_ITEMS[2]]));
    });

    test('should be hidden when there are no items that are completed', async () => {
        // Mark the first item as completed and then clear it
        await page.click('.todo-list li:first-child .toggle');
        await page.click('.clear-completed');

        // Check that the 'Clear completed' button is hidden
        const isHidden = await page.evaluate(() => {
            const btn = document.querySelector('.clear-completed');
            return !!btn && window.getComputedStyle(btn).display === 'none';
        });
        expect(isHidden).toBe(true);
    });
});

describe('Persistence', () => {
    beforeEach(async () => {
        await page.goto('https://demo.playwright.dev/todomvc');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should persist its data', async () => {
        // Create new todos
        for (const item of TODO_ITEMS.slice(0, 2)) {
            await page.type('.new-todo', item);
            await page.keyboard.press('Enter');
        }

        // Check the first todo item
        await page.click('.todo-list li:first-child .toggle');

        // Validate texts in the todo items
        let texts = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list label'), el => el.textContent));
        expect(texts).toEqual([TODO_ITEMS[0], TODO_ITEMS[1]]);

        // Validate if the first todo item is checked
        let isChecked = await page.evaluate(() => document.querySelector('.todo-list li:first-child .toggle').checked);
        expect(isChecked).toBe(true);

        // Validate classes
        let classes = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list li'), el => el.className));
        expect(classes).toEqual(['completed', '']);

        // Ensure there is 1 completed item
        const completedCount = await checkNumberOfCompletedTodosInLocalStorage(1);
        expect(completedCount).toBeTruthy();

        // Reload the page
        await page.reload();

        // Validate texts in the todo items again
        texts = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list label'), el => el.textContent));
        expect(texts).toEqual([TODO_ITEMS[0], TODO_ITEMS[1]]);

        // Validate if the first todo item is still checked
        isChecked = await page.evaluate(() => document.querySelector('.todo-list li:first-child .toggle').checked);
        expect(isChecked).toBe(true);

        // Validate classes again
        classes = await page.evaluate(() => Array.from(document.querySelectorAll('.todo-list li'), el => el.className));
        expect(classes).toEqual(['completed', '']);
    });
});

describe('Routing', () => {
    beforeEach(async () => {
        await page.goto('https://demo.playwright.dev/todomvc');
        await page.evaluate(() => {
            localStorage.clear();
        });
        await createDefaultTodos();
        const initialCheck = await checkTodosInLocalStorage(TODO_ITEMS[0]);
        expect(initialCheck).toBeTruthy();
    });

    test('should allow me to display active items', async () => {
        // Check the second todo item
        await page.click('.todo-list li:nth-child(2) .toggle');
        await checkNumberOfCompletedTodosInLocalStorage(1);

        // Click on the "Active" link
        await page.click('a[href="#/active"]');
        const activeItems = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.todo-list li:not(.completed)')).map(el => el.textContent.trim());
        });
        expect(activeItems.length).toBe(2);
        expect(activeItems).toEqual(expect.arrayContaining([TODO_ITEMS[0], TODO_ITEMS[2]]));
    });

    test('should respect the back button', async () => {
        // Mark the second item as completed
        await page.click('.todo-list li:nth-child(2) .toggle');
        await checkNumberOfCompletedTodosInLocalStorage(1);

        // Navigate to all items
        await page.click('a[href="#/"]');
        let itemsCount = await page.evaluate(() => document.querySelectorAll('.todo-list li').length);
        expect(itemsCount).toBe(3);

        // Navigate to active items
        await page.click('a[href="#/active"]');
        itemsCount = await page.evaluate(() => document.querySelectorAll('.todo-list li:not(.completed)').length);
        expect(itemsCount).toBe(2);

        // Navigate to completed items
        await page.click('a[href="#/completed"]');
        itemsCount = await page.evaluate(() => document.querySelectorAll('.todo-list li.completed').length);
        expect(itemsCount).toBe(1);

        // Test back functionality
        await page.goBack();
        itemsCount = await page.evaluate(() => document.querySelectorAll('.todo-list li:not(.completed)').length);
        expect(itemsCount).toBe(2);

        await page.goBack();
        itemsCount = await page.evaluate(() => document.querySelectorAll('.todo-list li').length);
        expect(itemsCount).toBe(3);
    });

    test('should allow me to display completed items', async () => {
        // Check the second todo item
        await page.click('.todo-list li:nth-child(2) .toggle');
        await checkNumberOfCompletedTodosInLocalStorage(1);

        // Navigate to completed items
        await page.click('a[href="#/completed"]');
        const completedItems = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.todo-list li.completed')).map(el => el.textContent.trim());
        });
        expect(completedItems.length).toBe(1);
    });

    test('should allow me to display all items', async () => {
        // Check the second todo item
        await page.click('.todo-list li:nth-child(2) .toggle');
        await checkNumberOfCompletedTodosInLocalStorage(1);

        // Navigate through filters
        await page.click('a[href="#/active"]');
        await page.click('a[href="#/completed"]');
        await page.click('a[href="#/"]');
        const allItems = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.todo-list li')).map(el => el.textContent.trim());
        });
        expect(allItems.length).toBe(3);
    });

    test('should highlight the currently applied filter', async () => {
        // Click on each filter and check if it is highlighted
        const selectors = ['#/', '#/active', '#/completed'];
        for (let sel of selectors) {
            await page.click(`a[href="${sel}"]`);
            const isHighlighted = await page.evaluate(sel => {
                const link = document.querySelector(`a[href="${sel}"]`);
                return link && link.classList.contains('selected');
            }, sel);
            expect(isHighlighted).toBe(true);
        }
    });
});










