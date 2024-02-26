describe('New Todo', () => {
    const TODO_ITEMS: string[] = [
        'Book doctor appointment',
        'Buy birthday gift for Mom',
        'Find place for vacation'
    ];

    beforeEach(() => {
        cy.visit('https://demo.playwright.dev/todomvc');
    });

    it('should allow me to add todo items', () => {
        // Create 1st todo.
        cy.get('.new-todo').type(`${TODO_ITEMS[0]}{enter}`);

        // Make sure the list only has one todo item.
        cy.get('.todo-list label').should('have.text', TODO_ITEMS[0]);

        // Create 2nd todo.
        cy.get('.new-todo').type(`${TODO_ITEMS[1]}{enter}`);

        // Make sure the list now has two todo items.
        cy.get('.todo-list label').should('contain.text', TODO_ITEMS[0])
            .and('contain.text', TODO_ITEMS[1]);

    });

    it('should clear text input field when an item is added', () => {
        // Create one todo item.
        cy.get('.new-todo').type(`${TODO_ITEMS[0]}{enter}`).should('have.value', '');

        // cy.window().its('localStorage').invoke('getItem', 'todos').should('exist');
        // cy.window().then((win) => {
        //     expect(win.localStorage.getItem('todos')).to.exist;
        // });

    });

    it('should append new items to the bottom of the list', () => {
        // Create 3 items.
        TODO_ITEMS.forEach(item => {
            cy.get('.new-todo').type(`${item}{enter}`);
        });

        // Check the todo count text.
        cy.get('.todo-count').contains('3 items left');

        // Check all items in one call.
        TODO_ITEMS.forEach((item, index) => {
            cy.get(`.todo-list li:nth-child(${index + 1}) label`).should('have.text', item);
        });

        // Example checking the length of list items as a proxy for number of todos.
        cy.get('.todo-list li').should('have.length', 3);
    });
    describe('Mark all as completed', () => {
        const TODO_ITEMS: string[] = [
            'Book doctor appointment',
            'Buy birthday gift for Mom',
            'Find place for vacation',
        ];

        beforeEach(() => {
            cy.visit('https://demo.playwright.dev/todomvc');
            TODO_ITEMS.forEach((item) => {
                cy.get('.new-todo').type(`${item}{enter}`);
            });
            // Assuming the app stores todos in local storage under "todos"
            // cy.window().its('localStorage').invoke('getItem', 'todos').should('have.length.at.least', 1);
        });

        it('should allow me to mark all items as completed', () => {
            // Complete all todos
            cy.get('.toggle-all').check();
            cy.get('.todo-list li').each(($el) => {
                cy.wrap($el).should('have.class', 'completed');
            });
            // Check for completed todos in local storage
            // cy.window().then((win) => {
            //     const todos = JSON.parse(win.localStorage.getItem('todos') || '[]');
            //     expect(todos.filter((t: any) => t.completed).length).to.eq(TODO_ITEMS.length);
            // });
        });

        it('should allow me to clear the complete state of all items', () => {
            cy.get('.toggle-all').check().uncheck();
            cy.get('.todo-list li').each(($el) => {
                cy.wrap($el).should('not.have.class', 'completed');
            });
        });

        it('complete all checkbox should update state when items are completed / cleared', () => {
            cy.get('.toggle-all').check();
            cy.get('.toggle-all').should('be.checked');
            // Assuming the first todo can be unchecked by clicking its toggle button
            cy.get('.todo-list li .toggle').first().uncheck();
            cy.get('.toggle-all').should('not.be.checked');
            cy.get('.todo-list li .toggle').first().check();
            cy.get('.toggle-all').should('be.checked');
        });
    });

    describe('Item', () => {
        const TODO_ITEMS: string[] = [
            'Book doctor appointment',
            'Buy birthday gift for Mom',
            'Find place for vacation',
        ];

        beforeEach(() => {
            cy.visit('https://demo.playwright.dev/todomvc');
            TODO_ITEMS.forEach((item) => {
                cy.get('.new-todo').type(`${item}{enter}`);
            });
        });

        it('should allow me to mark items as complete', () => {
            // Check first item as complete
            cy.get('.todo-list li .toggle').first().check();
            cy.get('.todo-list li').first().should('have.class', 'completed');

            // Check second item as complete
            cy.get('.todo-list li .toggle').eq(1).check();
            cy.get('.todo-list li').eq(1).should('have.class', 'completed');
        });

        it('should allow me to un-mark items as complete', () => {
            // Check and then uncheck first item
            cy.get('.todo-list li .toggle').first().check().uncheck();
            cy.get('.todo-list li').first().should('not.have.class', 'completed');
        });

        it('should allow me to edit an item', () => {
            // Double-click on second item to trigger edit mode
            cy.get('.todo-list li').eq(1).find('label').dblclick();
            // Assuming a class of .edit is added to the input on edit mode
            cy.get('.todo-list li').eq(1).find('.edit').clear().type('buy some sausages{enter}');

            // Assert the new text value
            cy.get('.todo-list li').eq(1).should('contain.text', 'buy some sausages');
        });
    });
    describe('Editing', () => {
        const TODO_ITEMS: string[] = [
            'Book doctor appointment',
            'Buy birthday gift for Mom',
            'Find place for vacation',
        ];

        beforeEach(() => {
            cy.visit('https://demo.playwright.dev/todomvc');
            TODO_ITEMS.forEach((item) => {
                cy.get('.new-todo').type(`${item}{enter}`);
            });
        });

        it('should hide other controls when editing', () => {
            cy.get('.todo-list li').eq(1).dblclick();
            cy.get('.todo-list li').eq(1).find('.toggle').should('not.be.visible');
            cy.get('.todo-list li').eq(1).find('label').should('not.be.visible');
        });

        it('should save edits on blur', () => {
            cy.get('.todo-list li').eq(1).dblclick();
            cy.get('.todo-list li').eq(1).find('.edit').clear().type('buy some sausages').blur();
            cy.get('.todo-list li label').eq(1).should('have.text', 'buy some sausages');
        });

        it('should trim entered text', () => {
            cy.get('.todo-list li').eq(1).dblclick();
            cy.get('.todo-list li').eq(1).find('.edit').clear().type('    buy some sausages    {enter}');
            cy.get('.todo-list li label').eq(1).should('have.text', 'buy some sausages');
        });

        it('should remove the item if an empty text string was entered', () => {
            cy.get('.todo-list li').eq(1).dblclick();
            cy.get('.todo-list li').eq(1).find('.edit').clear().type('{enter}');
            cy.get('.todo-list li').should('have.length', 2);
        });

        it('should cancel edits on escape', () => {
            cy.get('.todo-list li').eq(1).dblclick();
            cy.get('.todo-list li').eq(1).find('.edit').type('buy some sausages{esc}');
            cy.get('.todo-list li label').eq(1).should('not.have.text', 'buy some sausages');
        });
    });
    describe('Counter', () => {
        const TODO_ITEMS: string[] = [
            'Book doctor appointment',
            'Buy birthday gift for Mom',
            'Find place for vacation',
        ];

        beforeEach(() => {
            cy.visit('https://demo.playwright.dev/todomvc');
        });

        it('should display the current number of todo items', () => {
            // Add the first todo item
            cy.get('.new-todo').type(`${TODO_ITEMS[0]}{enter}`);
            cy.get('.todo-count').contains('1 item left');

            // Add the second todo item
            cy.get('.new-todo').type(`${TODO_ITEMS[1]}{enter}`);
            cy.get('.todo-count').contains('2 items left');
        });
    });

    describe('Clear completed button', () => {
        const TODO_ITEMS: string[] = [
            'Book doctor appointment',
            'Buy birthday gift for Mom',
            'Find place for vacation',
        ];

        beforeEach(() => {
            cy.visit('https://demo.playwright.dev/todomvc');
            TODO_ITEMS.forEach((item) => {
                cy.get('.new-todo').type(`${item}{enter}`);
            });
        });

        it('should display the correct text', () => {
            // Mark the first todo item as completed
            cy.get('.todo-list li .toggle').first().check();
            cy.contains('button', 'Clear completed').should('be.visible');
        });

        it('should remove completed items when clicked', () => {
            // Mark the second todo item as completed
            cy.get('.todo-list li .toggle').eq(1).check();
            cy.contains('button', 'Clear completed').click();

            // Verify that only two items remain
            cy.get('.todo-list li').should('have.length', 2);
            // cy.get('.todo-list li label').should(($labels) => {
            //     expect($labels).to.contain(TODO_ITEMS[0]);
            //     expect($labels).to.contain(TODO_ITEMS[2]);
            // });
        });

        it('should be hidden when there are no items that are completed', () => {
            // Initially, without any completed items, the button should not exist
            cy.contains('button', 'Clear completed').should('not.exist');

            // Mark and then unmark the first todo item as completed
            cy.get('.todo-list li .toggle').first().check().uncheck();
            cy.contains('button', 'Clear completed').should('not.exist');
        });
    });

    describe('Persistence', () => {
        const TODO_ITEMS: string[] = [
            'Book doctor appointment',
            'Buy birthday gift for Mom',
            'Find place for vacation',
        ];
        beforeEach(() => {
            cy.visit('https://demo.playwright.dev/todomvc');
        });

        it('should persist its data', () => {
            // Add two todo items
            TODO_ITEMS.slice(0, 2).forEach((item) => {
                cy.get('.new-todo').type(`${item}{enter}`);
            });

            // Check the first todo item
            cy.get('.todo-list li .toggle').first().check();

            // Verify the first item is completed
            cy.get('.todo-list li').first().should('have.class', 'completed');

            // Verify the text of todo items
            cy.get('.todo-list label').each(($el, index) => {
                expect($el).to.have.text(TODO_ITEMS[index]);
            });

            // Verify local storage for completeness (Optional step, see note below)
            cy.window().then((win) => {
                const todos = JSON.parse(win.localStorage.getItem('todos') || '[]');
                expect(todos.filter((t:any) => t.completed).length).to.eq(1);
            });

            // Reload the page
            cy.reload();

            // Verify the items are still displayed and the first item remains completed
            cy.get('.todo-list li').first().should('have.class', 'completed');
            cy.get('.todo-list label').each(($el, index) => {
                expect($el).to.have.text(TODO_ITEMS[index]);
            });
        });
    });

    describe('Routing', () => {
        const TODO_ITEMS: string[] = [
            'Book doctor appointment',
            'Buy birthday gift for Mom',
            'Find place for vacation',
        ];

        beforeEach(() => {
            cy.visit('https://demo.playwright.dev/todomvc');
            TODO_ITEMS.forEach((item) => {
                cy.get('.new-todo').type(`${item}{enter}`);
            });
        });

        it('should allow me to display active items', () => {
            // Check the second todo item to mark it as completed
            cy.get('.todo-list li .toggle').eq(1).check();

            // Filter for active items
            cy.contains('a', 'Active').click();

            // Verify that only the active items are shown
            cy.get('.todo-list li').should('have.length', 2);
            cy.get('.todo-list li label').should(($labels) => {
                expect($labels.eq(0)).to.contain(TODO_ITEMS[0]);
                expect($labels.eq(1)).to.contain(TODO_ITEMS[2]);
            });
        });

        it('should allow me to display completed items', () => {
            // Check the second todo item to mark it as completed
            cy.get('.todo-list li .toggle').eq(1).check();

            // Filter for completed items
            cy.contains('a', 'Completed').click();

            // Verify that only the completed items are shown
            cy.get('.todo-list li').should('have.length', 1);
            cy.get('.todo-list li label').should('contain', TODO_ITEMS[1]);
        });

        it('should allow me to display all items', () => {
            // Check the second todo item to mark it as completed
            cy.get('.todo-list li .toggle').eq(1).check();

            // Use filters and then return to All
            cy.contains('a', 'Active').click();
            cy.contains('a', 'Completed').click();
            cy.contains('a', 'All').click();

            // Verify that all items are shown
            cy.get('.todo-list li').should('have.length', 3);
        });

        it('should highlight the currently applied filter', () => {
            cy.contains('a', 'Active').click();
            cy.get('.filters li a.selected').should('contain', 'Active');

            cy.contains('a', 'Completed').click();
            cy.get('.filters li a.selected').should('contain', 'Completed');

            cy.contains('a', 'All').click();
            cy.get('.filters li a.selected').should('contain', 'All');
        });
    });
});
