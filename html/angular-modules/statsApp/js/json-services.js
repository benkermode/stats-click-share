'use strict';

angular.module ( 'statsApp.jsonServices', [])

/*
  SHARE RATE
  includes actual shares and actual pageviews: but pageviews are already listed toplevel for each article
  assume this figure only comes from shares from statplace.net
  • show share rate compared to average (2 bars)
  • show pageviews compared to average (2 bars)

  CLICK RATE
  Rate at which people click on full story from Facebook
  Assume each story with this stat has equal exposure
  Could be broken down by Facebook accounts
  • facebook and twitter main bars ( 2 bars )
  • facebook breakdown, twitter breakdown ( 2 bars x 2 )

  PAGEVIEWS
  Views on website
  Could be broken down by referrer

*/

  .service ( 'GraphDataTemplate', [ function () {
    return {
      "share_rate":  {
        "avg_share_rate" : {
          "label": "Average Share Rate",
          "color": '#ff974d',
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "avg_share_rate" 
        },
        "share_rate" : {
          "label": "This Article Share Rate",
          "color": false,
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "article.share_rate",
          "bar_height_ratio" : 2,
        },
        "max" : {
          "label": "Max Ever Share Rate",
          "color": '#33cc33',
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "max_ever_share_rate" 
        },
      },
      "click_rate" : {
        "avg_click_rate" : {
          "label": "Average  Click Rate",
          "color": '#ff974d',
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "avg_click_rate" 
        },
        "max" : {
          "is_percentage" : true,
          "label": "Max Ever Click Rate",
          "color": '#33cc33',
          "value": false,
          "use_scope_var" : "max_ever_click_rate" 
        },
        "click_rate" : {
          "label": "This Article Click Rate",
          "color": '#3b5998',
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "article.click_rate",
          "bar_height_ratio" : 2,
        },
        "click_rate_children" : {
          "use_children_object" : "article.click_rate_children",
        }

      },
      "pageviews" : {
        "avg_pageviews" : {
          "is_percentage" : false,
          "label": "Average  Pageviews",
          "color": '#ff974d',
          "value": false,
          "use_scope_var" : "avg_pageviews" 
        },
        "pageviews" : {
          "is_percentage" : false,
          "label": "This Article Pageviews",
          "color": false,
          "value": false,
          "use_scope_var" : "article.Pageviews",
          "bar_height_ratio" : 2,
        },
        "max" : {
          "is_percentage" : false,
          "label": "Max Ever Pageviews",
          "color": '#33cc33',
          "value": false,
          "use_scope_var" : "max_ever_pageviews" 
        },
      }
    }
  }])


  .service ( 'GraphSettings', function () {
    return {
      "desktop" : { 
        "height": 20, 
        "graphTopMargin" : 0, 
        "barBottomMargin" : 5, 
        "textY" : "insideBar", //insdieBar, aboveBar
        "textX" : "rightAlign", //rightAlign, leftAlign
        "fontSize" : 12 
      },
      "mobile" : { 
        "height": 20, 
        "graphTopMargin" : 0, 
        "barBottomMargin" : 18, 
        "textY" : "aboveBar", 
        "textX" : "leftAlign", 
        "fontSize" : 11  
      },
      "textFillOutside" : "#333", 
      "textFillInside" : "#fff",
      "assumeTextWidth" : 175,
      "textPadding": 10

    }
  })
