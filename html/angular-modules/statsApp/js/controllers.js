'use strict';

angular.module ( 'statsApp.controllers', [] )

  .controller ( 'ApplicationController', [ 
    '$scope', '$interval', 'GraphBuilder', 'DataBuilder', 'ScreenVars', 'MediaWatcher', 'GraphDataTemplate','GraphSettings', 'DataService', '$filter', 'GlobalData', '$timeout',
    function ( 
      $scope, $interval, GraphBuilder, DataBuilder, ScreenVars, MediaWatcher, GraphDataTemplate, GraphSettings, DataService, $filter, GlobalData, $timeout ) {

      //the following could be set by incoming JSON
      GlobalData.percDecimalPlaces = 0;
      GlobalData.rgbNuetralGray = 25;
      $scope.ScreenVars = ScreenVars;
      $scope.$on( 'screenVarsChanged', function(event, data) {
        buildGraphsFromScreenDataChange ( data );
        //console.log ( 'SCOPE.on data: ' + JSON.stringify ( data )  );
      });


      var data;
      $scope.currentPage = 1;

      $scope.getPage = function ( page ) {
        //only get page is page is a number
        $scope.articles = [];

        //check page is whole number
        page = ( page % 1 ) == 0 ? page : $scope.currentPage; 
        $scope.currentPage = page;
        $scope.dataError = false;
        DataService.GetPageData  ( page )
          .then ( function ( response ) {
            //manually clean the global numbers: we know every prop is a number
            data = response.data;
            response = null;
            angular.forEach ( data.global_data, function ( v, k ) {
              //set on data and scope (GraphDataProvider needs it on data
              $scope [ k ] = $filter( 'numberCleaner' ) ( v );
            });
            //manually clean the props we want as numbers
            angular.forEach( data.articles, function( v, k) {
              v.share_rate = $filter( 'numberCleaner' )( v.share_rate );
              v.click_rate = $filter( 'numberCleaner' )( v.click_rate );
              v.Pageviews = $filter( 'numberCleaner' )( v.Pageviews );
              //set the relative stats of this article vs global averages
              v.perc_diff_share_rate = $filter ( 'getPercDiff' ) ( v.share_rate, $scope.avg_share_rate );
              v.perc_diff_click_rate = $filter ( 'getPercDiff' ) ( v.click_rate, $scope.avg_click_rate );
              v.perc_diff_pageviews = $filter ( 'getPercDiff' ) ( v.Pageviews, $scope.avg_pageviews );
            });
            $scope.articles = data.articles; 
            //important service for building the graphs from templates
            DataBuilder.buildArticles ( $scope );

            buildPages();
            response = null; 
            //set screenSize and mediaWatch vars
            MediaWatcher.init();

            //TEMP!!//
            $scope.showMoreArticle(0, 'click_rate');
            //END TEMP!!//

          }, function (response) {
            $scope.dataError = true;
          });
      }


      //    $timeout( function () { 
      $scope.getPage();
      //    }, 1000 );

      $scope.showMoreArticle = function ( index, which ) {
        //console.log ( 'showmore: ' + index + ', ' + which );
        angular.forEach ( $scope.articles, function ( v, k ) {
          v.extrasRevealed = false;
        });
        if ( index == 'close' ) {
          $scope.extrasRevealedIndex = false;st
          $scope.extrasRevealedCategory = false;
        } else {
          $scope.extrasRevealedIndex = index;
          console.log ( 'set extrasRevealedIndex: ' + $scope.extrasRevealedIndex );
          $scope.extrasRevealedCategory = which;
          $scope.articles [ index ].extrasRevealed = true; 
                    //point the graph ng-repeater to the selected data set within the article (eg share_rate)
          //the dom nodes won't be built until this happens
          $scope.articles [ index ].selectedGraphData = $scope.articles [ index ].graphData [ which ];
          //buildOneGraph();
          GraphBuilder.buildOneGraph ( index, which, $scope.articles [ index ]);
        }
      }

      function buildGraphsFromScreenDataChange ( data ) {
        //remember index can be 0, and if it's false we don't need it
        //also check we have both screenSize and svgWidth
        if ( $scope.extrasRevealedIndex > -1 ) {
//          $scope.articles [ $scope.extrasRevealedIndex ].svgWidth = ScreenVars.svgWidth;
//          $scope.articles [ $scope.extrasRevealedIndex ].screenSize = ScreenVars.screenSize;
          //buildOneGraph ();
          GraphBuilder.buildOneGraph ( $scope.extrasRevealedIndex, $scope.extrasRevealedCategory, $scope.articles [ $scope.extrasRevealedIndex ]);
          //broadCast emit, the source of this call, strangely happens outside of $digest, so call $apply
          $timeout ( function () {
            $scope.$apply();
          }, 0);
        }
      }

      function buildPages() {
        //console.log ( '$scope.global.total_pages: ' + $scope.global.total_pages );
        $scope.pages = [];
        var dotCount = 0;
        for ( var i=0; i< $scope.total_pages; i++ ) {
          $scope.pages[ i ] = {};
          $scope.pages[ i ].tiny = false;
          if ( $scope.total_pages < 10 ) {
            $scope.pages[ i ].value = i + 1;
            $scope.pages[ i ].display = true;
          } else {
            if  ( 
              ( i == 0 ) 
                || ( (i + 1) == ( $scope.total_pages ) ) 
                || ( (i + 1) == ( $scope.current_page ) ) 
                || ( (i + 1) == ( $scope.current_page - 1 ) ) 
                || ( (i + 1)  == ( $scope.current_page + 1 ) ) 
            ) {
              $scope.pages[ i ].value = i + 1;
              $scope.pages[ i ].display = true;
              dotCount=0;
            } else {
              dotCount = ( dotCount <= 3 ) ? dotCount + 1 : dotCount;
              $scope.pages[ i ].value = ( dotCount == 4 ) ? '' : '.';
              $scope.pages[ i ].display = ( dotCount == 4 ) ? false : true;

            }
          }
        }
      }
    }]) // end Application Controller

;
