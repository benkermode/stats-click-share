<?php
   //set $dev to false to use production js / css bundles locally
   $dev = true;
   //assume use of prod js / css bundles
   $prod_mode = true;

   if ( $dev && ( strstr ( $_SERVER[ 'HTTP_HOST' ], 'local.stats.net' ) ) )  {
   $prod_mode = false;
   }
   ?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>StatsApp</title>
    <link rel="stylesheet" href="css/bundle.css">
    <!-- <link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro:300' rel='stylesheet' type='text/css'> -->
  </head>
  <body ng-app="statsApp" ng-controller="ApplicationController">

    <div id="content">

      <header>
        <h1>Statplace.net</h1>
        <h2> - Click Share</h2>
      </header>

      <!--averages-->
      <section>
        <div class="average-box">
          Statplace average share rate
          <div class="global-average-number" ng-show="avg_share_rate" ng-bind="avg_share_rate | numberDisplayer:false:true"></div>
        </div>
        <div class="average-box">
          Statplace average click rate
          <div class="global-average-number" ng-show="avg_click_rate" ng-bind="avg_click_rate | numberDisplayer:false:true"></div>
        </div>
        <div class="average-box">
          Statplace average pageviews
          <div class="global-average-number" ng-bind="avg_pageviews |  numberDisplayer:false:false"></div>
        </div>
      </section>

      <!--articles-->
ScreenVars.graphTopOffset {{ ScreenVars.graphTopOffset }}
      <section>

        <div id="articles-headers">
          <div class="article-title-group">
            <div class="pages">
              Page <span 
                      class="page-number"
                      ng-repeat="page in pages"
                      ng-click="(page.value > 0 ) && getPage ( page.value )"
                      ng-class="{ 'active' : page.value == current_page  }"
                      ng-bind="page.value"
                      ng-hide="!page.display">
              </span>

            </div>
          </div><!--article-title-group-->
          <div class="article-stats-group">
            <div class="core-stat header">Share Rate</div>
            <div class="core-stat header">Click Rate</div>
            <div class="core-stat header">Pageviews</div>
          </div><!--article-stats-group-->

        </div><!--end articles-headers-->

        <div id="articles-container">

          <img src="images/loading-white.gif" alt="Loading data" id="articles-loading" ng-hide="articles.length > 0"/>

          <article  class="stats-article" ng-repeat="article in articles">
            <div class="article-title-group">
              <div class="article-id" ng-bind="article.ID"></div>
              <div class="article-title-and-details">
                <a ng-href="{{article.URL}}" class="article-headline" ng-bind="article.Headline" target="_new"></a>
                <div class="article-details">
                  <div class="article-detail"><span ng-bind="article.publish_date"></span>, <span ng-bind="article.publish_time"></span></div>
                  <div class="article-detail" ng-bind="article.authors"></div>
                  <div class="article-detail" ng-bind="article.Section"></div>


                </div><!--article-details-->
              </div><!--article-title-and-details-->
            </div><!--article-title-group-->
            <div class="article-stats-group">
              <!--share rate-->
              <div class="core-stat">
                <div 
                   class="article-perc" 
                   ng-show="article.share_rate"
                   ng-bind="article.share_rate | numberDisplayer:false:true"
                   get-relative-color="{{article.perc_diff_share_rate}}"
                   apply-color-to="color"
                   max-color-value="150"
                   my-group="share_rate">
                </div>
                <div 
                   class="article-perc-diff" 
                   ng-show="article.share_rate" 
                   ng-bind="( article.perc_diff_share_rate | numberDisplayer:true:true )" 
                   style="background-color: {{false | barColorFilter:$index:'share_rate' }} ">
                </div>
                <span 
                   ng-show="article.share_rate"
                   class="article-show-more"
                   ng-class="{ 'active' : ( extrasRevealedIndex == $index ) && ( extrasRevealedCategory == 'share_rate' )}"
                   ng-click="showMoreArticle($index, 'share_rate')">More info</span>
                <div ng-hide="article.share_rate">N/A</div>
              </div>

              <!--click rate-->
              <div class="core-stat">
                <div
                   class="article-perc" 
                   ng-show="article.click_rate"
                   ng-bind="article.click_rate | numberDisplayer:false:true"
                   get-relative-color="{{article.perc_diff_click_rate}}"
                   apply-color-to="color"
                   max-color-value="150"
                   my-group="click_rate">
                </div>
                <div
                   class="article-perc-diff"
                   ng-show="article.click_rate"
                   ng-bind="( article.perc_diff_click_rate | numberDisplayer:true:true )"
                   style="background-color: {{false | barColorFilter:$index:'click_rate' }} ">
                </div>
                <span
                   ng-show="article.click_rate"
                   class="article-show-more"
                   ng-class="{ 'active' : ( extrasRevealedIndex == $index ) && ( extrasRevealedCategory == 'click_rate' )}"
                   ng-click="showMoreArticle($index, 'click_rate')">More info</span>
                <div ng-hide="article.click_rate">N/A</div>
              </div>

              <!--pageviews-->
              <div class="core-stat">
                <div 
                   class="article-perc"
                   ng-show="article.Pageviews"
                   ng-bind="( article.Pageviews | numberDisplayer )"
                   get-relative-color="{{article.perc_diff_pageviews}}"
                   apply-color-to="color"
                   max-color-value="2000"
                   my-group="pageviews"></div>
                <div
                   class="article-perc-diff"
                   ng-show="article.Pageviews"
                   ng-bind="( article.perc_diff_pageviews | numberDisplayer:true:false )"
                   style="background-color: {{false | barColorFilter:$index:'pageviews' }} ">
                </div>
                <span
                   ng-show="article.Pageviews"
                   class="article-show-more"
                   ng-class="{ 'active' : ( extrasRevealedIndex == $index ) && ( extrasRevealedCategory == 'pageviews' )}"
                   ng-click="showMoreArticle($index, 'pageviews')">More info</span>
                <div ng-hide="article.Pageviews">N/A</div>
              </div>
            </div><!--article-stats-group-->

            <div class="article-extras" ng-class="{ 'hidden' : !article.extrasRevealed, 'revealed' : article.extrasRevealed}">
              <span class="article-extras-close-btn" ng-click="showMoreArticle( 'close' )">Close</span>

              
                <svg class="article-svg" id="svg-{{$index}}" get-svg-width="{{$index}}">
                <!--article.selectedGraphData won't exist until the user selects more info-->
                <g class="graph-allbars-group" ng-attr-transform="translate(0,{{ScreenVars.graphTopOffset}})">
                <!--article.selectedGraphData won't exist until the user selects more info-->
                <!--bar width: compare with max value of this group for relative percentage width-->
                <!--bar width: can use a filter because it's constant: percentage-->
                <!--bar color: get the saved relative color for this stat-->
                <!--text x, y, color, bar x, y: use $scope.buildGraph()-->
                <g ng-repeat="bar in article.selectedGraphData" ng-show="bar.value!=undefined">
                  <rect 
                     ng-attr-x="{{bar.x}}"
                     ng-attr-y="{{bar.y}}"
                     ng-attr-width="{{bar.width}}%"
                     ng-attr-height="{{bar.height}}"
                     ng-attr-fill="{{bar.color | barColorFilter:$parent.$index:extrasRevealedCategory}}"></rect>
                  <text 
                     alignment-baseline="hanging"
                     font-family="sans-serif"
                     font-size="{{bar.text.fontSize}}"
                     ng-attr-x="{{bar.text.x}}" 
                     ng-attr-fill="{{bar.text.fill}}" 
                     ng-attr-y="{{bar.text.y}}" >{{bar.label}} - {{ bar.value | numberDisplayer:FALSE:bar.is_percentage:2 }}</text>
                </g>
                </g><!--graph-allbars-group-->
              </svg>
            </div>

          </article>

        </div><!--articles-container-->
      </section>

      <!--footer-->
      <footer ng-show="articles.length > 0">
        Page <span ng-bind="global.current_page"></span> of <span ng-bind="global.total_pages"></span>
      </footer>
    </div><!--end content-->

    <?php if ( $prod_mode ) { ?>
    <script src="js/bundle.js"></script>
    <?php } else { ?>
    <script src="libs/1.4.4.angular.min.js"></script>
    <script src="angular-modules/statsApp/statsApp.js"></script>
    <script src="angular-modules/statsApp/js/controllers.js"></script>
    <script src="angular-modules/statsApp/js/directives.js"></script>
    <script src="angular-modules/statsApp/js/filters.js"></script>
    <script src="angular-modules/statsApp/js/services.js"></script>
    <script src="angular-modules/statsApp/js/json-services.js"></script>
    <?php }  ?>


  </body>
</html>
