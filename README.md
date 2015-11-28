# StatPlace Analytics Demo
A prototype app for site analytics data, written in AngularJS.

##Filters
[filters.js](html/angular-modules/statsApp/js/filters.js) contains a number of filters which "clean" incoming JSON data, display data in configurable ways in the view, and make some calculations for graph data.

##Relative Color
Each main stat has a relative color calculated by [directives.js](html/angular-modules/statsApp/js/directives.js). The associated max-color-value determines the number for comparison. If max-color-value is 150, and the current item has a value of 150, the statistic will be turned bright green. Likewise bright red for -150, black for numbers close to zero, and varying degrees of color in between. This gives the reader an instant feeling on the meaning of statistics relative to each other, without requiring thinking.

##Internal Graph Templates
Graphs are displayed and calculated using internal graph templates in [json-services.js](html/angular-modules/statsApp/js/json-services.js). These JS objects determine how many graphs to display for each core statistic, and what text label to assign each. It's possible to use the same template for many items of data, because of the following functions:
• "use_scope_var" : "avg_click_rate” tells the app to look for the scope variable named "avg_click_rate" and insert it
• "use_children_object" : "article.click_rate_children”, tells the app to look for an object named click_rate_children in the current item's data, and if it exists, insert all its children in the graph, with one bar graph and its label produced for each of the children. 
This custom functionality becomes a powerful way to reduce JSON filesize, and behaves somewhat like a mini-framework.

