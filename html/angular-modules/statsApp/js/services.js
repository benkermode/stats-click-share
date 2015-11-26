'use strict';

angular.module ( 'statsApp.services', [])


  .factory( 'GlobalData', function () {
    return {};
  })

  .factory( 'ScreenVars', function () {
    return {}
  })

  .service ( 'DataService', [ '$http', function ( $http ) {
    return {
      //mock method for returning one of 4 discreet json files
      GetPageData: function ( page ) {
        page = ( page <= 4) ? page : 4;
        var url = 'data/click-share-p' + String( page ) + '.json';
        console.log ( 'getting: ' + url );
        //change url to test data error
        return $http.get ( url );
      }
    }
  }])

  .factory( 'MediaWatcher', [ '$window', 'ScreenVars','$timeout','$rootScope',  function ( $window, ScreenVars, $timeout, $rootScope ) {
    return {
      init: function () {

        //these obviously match rules in external CSS, and are most effective when they do: Not perfectly DRY, but still nifty
        var Watch1024 = $window.matchMedia ( '(min-width: 1024px)' );
        var Watch768 = $window.matchMedia ('(min-width: 768px) and (max-width: 1023px)' );
        var Watch480 = $window.matchMedia ('(min-width: 480px) and (max-width: 767px)');
        var Watch320 = $window.matchMedia ('(min-width: 320px) and (max-width: 479px)');

        //this handler will get called by any of the Watchers above, so we have to check which one
        var handleMediaChange = function ( mediaQueryList ) {
          if ( mediaQueryList.matches ) {
            //set ScreenSize to numbers for use of comparison operators
            if ( mediaQueryList.media.indexOf ( '1024px' ) > -1 ) {
              ScreenVars.screenSize = 1024;
            } else if ( mediaQueryList.media.indexOf ( '768px' ) > -1 ) {
              ScreenVars.screenSize = 768;
            } else if ( mediaQueryList.media.indexOf ( '480px' ) > -1 ) {
              ScreenVars.screenSize = 480;
            } else if ( mediaQueryList.media.indexOf ( '320px' ) > -1 ) {
              ScreenVars.screenSize = 320;
            } 
            if ( ScreenVars.svgElement ) {
              ScreenVars.svgWidth = ScreenVars.svgElement.offsetWidth;
              console.log ( "ScreenVars.svgHeight: " + ScreenVars.svgHeight);
              ScreenVars.svgHeight = ScreenVars.svgElement.offsetHeight;

            }
            $rootScope.$broadcast('screenVarsChanged',  {});

          }
        }

        Watch1024.addListener( handleMediaChange );
        Watch768.addListener( handleMediaChange );
        Watch480.addListener( handleMediaChange );
        Watch320.addListener( handleMediaChange );
          handleMediaChange ( Watch1024 );
          handleMediaChange ( Watch768 );
          handleMediaChange ( Watch480 );
          handleMediaChange ( Watch320 );

      }
    }
  }])

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
          "color": '#0ec4ac',
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
        "click_rate" : {
          "label": "This Article Click Rate",
          "color": false,
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "article.click_rate",
          "bar_height_ratio" : 2,
        },
        "max" : {
          "is_percentage" : true,
          "label": "Max Ever Click Rate",
          "color": '#0ec4ac',
          "value": false,
          "use_scope_var" : "max_ever_click_rate" 
        },
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
          "color": '#0ec4ac',
          "value": false,
          "use_scope_var" : "max_ever_pageviews" 
        },
      }
    }
  }])

;
