# StatPlace Analytics Demo
A prototype app for site analytics data, written in AngularJS.

##Filters
[filters.js](html/angular-modules/statsApp/js/filters.js) contains a number of filters which "clean" incoming JSON data, display data in configurable ways in the view, and make some calculations for graph data.

##Relative Color
Each main stat has a relative color calculated by [directives.js](html/angular-modules/statsApp/js/directives.js). The associated max-color-value determines the number for comparison. If max-color-value is 150, and the current item has a value of 150, the statistic will be turned bright green. Likewise bright red for -150, black for numbers close to zero, and varying degrees of color in between. This gives the reader an instant feeling on the meaning of statistics relative to each other, without requiring thinking.


