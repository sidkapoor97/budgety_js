//Budget Controller Module
var budgetController = (function() {

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    // Calculate the %age
    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0)
            this.percentage = Math.round( this.value / totalIncome * 100 );
        else
            this.percentage  = -1;

    };

    // Return the %age
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(cur) { 
            sum += cur.value;
        });

        data.totals[type] = sum;
    }

    var data = {
        allItems : {
            exp: [],
            inc:  []
        },

        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage : -1
    };

    return {
        addItem: function(type, des, val){

            var newItem, ID;


            //Create new ID
            if(data.allItems[type].length === 0) {
                ID = 0;
            }
            else {
                ID = data.allItems[type][data.allItems[type].length - 1].id+1;
            }

            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new item
            return newItem;
        },

        deleteItem: function(type, id) {

            var ids, index;

            //map returns an arr whereas foreach doesnt
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            })

        },

        getPercentage: function() {

            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });

            return allPerc;

        },

        calculateBudget: function() {

            // Also calculate the total income, total expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget = Total Income - Total Expenses
            data.budget = data.totals['inc'] - data.totals['exp'];

            // Calculate the %ages of expenses
            if(data.totals['inc'] > 0)
                {            
                    data.percentage = Math.round( ( data.totals.exp / data.totals.inc ) * 100 );
                }
            else
                data.percentage = -1;
            },

        getBudget : function(){
            return {
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage: data.percentage
            }
        },

        testing : function() {
            console.log(data);
        }
    }

})();

//UI Controller Module
var UIController = (function() {

    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercentageLabel : '.item__percentage'
    }

    return {
        getInput: function(){

            //Get values from the input fields
            return {
                type : document.querySelector(DOMStrings.inputType).value,  //Will be either inc or exp
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {

            var html, newHtml, element;

            // Create HTML with placeholder text

            if(type === 'inc') {
                
                element  = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            } else if(type === 'exp') {

                element  = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the placeholder text with actual data from newItem
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert HTML using DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj){

            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;

            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage+' %';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            } 


        },

        displayPercentages: function(percentages){

            //returns a Node List -> different from List
            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);
            console.log(fields);
            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i],i);
                    
                }
            };

            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0)
                    current.textContent = percentages[index] + ' %';
                else
                    current.textContent = '---';
            });

        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    };

})();




//Global App Controller
var controller = (function(budgetCtrl, UICtrl){

    //Place Event Listeners here
    var setupEventListeners = function() {

        //Get access to DOM Strings by making it Public
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    
    
    var updateBudget = function() {

        var budget;

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Returns the budget
        budget = budgetCtrl.getBudget();

        // 3. Display the budget
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentage();
        console.log(percentages);

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function(){

        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if((input.description !== '') && !(isNaN(input.value)) && input.value > 0) {

                // 2. Add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                // 3. Add the item to the UI
                UICtrl.addListItem(newItem, input.type);

                // 4. Clear the fields
                UICtrl.clearFields();

                // 5. Calculate and Update the budget
                updateBudget();

                // 6. Calculate and update the percentages
                updatePercentages();
            }

    };

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0]
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 6. Calculate and update the percentages
            updatePercentages();

        }

    };


    return {
        init: function(){
            console.log('Application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc : 0,
                totalExp : 0,
                percentage: 0
            });
            setupEventListeners();
        }
    }
    

})(budgetController, UIController);

controller.init();