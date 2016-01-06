
  //------------ Functions ------------//

  //verseText = ""

  isValidPassword = function isValidPassword(val) {
     return val.length >= 6 ? true : false; 
  }

  signIn = function signIn(e,t,topNav){
    var emailRaw = t.find('#email').value
      var password = t.find('#password').value
      var emailTrimmed = trimInput(emailRaw);
      var email = validateEmail(emailTrimmed)

      if(email && password){
        if (!isValidPassword(password)){
          Session.set('errorMsg', 'Password is too short')
        }else{
          //console.log('login')
          Meteor.loginWithPassword(emailTrimmed, password, function(err){
            //console.log('meteor call')
            
            if (err){
              console.log(err)
              if(err == 'Error: Incorrect password [403]'){
                Session.set('errorMsg', "Incorrect password")
              }else{
                Session.set('errorMsg', "Account doesn't exist")
              }
              //console.log(err)
            }
            else if(topNav){
              //console.log('close overlay, route to home')
              $('.black-overlay .close').click()
              mixpanel.identify(Meteor.userId());
              //Router.home();
              window.location = '/'
            } else{
              $('.black-overlay .close').click()
              Session.set('loggedIn', true)
              $("#donation-container").empty()
              Blaze.render(Template.credit_form_tmpl, $('#donation-container')[0])
              //UI.insert(UI.render(Template.credit_form_tmpl), document.getElementById('donation-container'))
              
            }
          });
        }
      }else{
        if(email){
          Session.set('errorMsg', 'Field missing')
          $('.sign-in-input').each(function(){
            var inputVal = $(this).val()
            if(!inputVal){
              $(this).addClass('error').focus(function(){
                $(this).removeClass('error')
              })
            }
          })
        }else{
          Session.set('errorMsg', 'Email is incorrect')
        }
        
      } 
  }
  clearSessions = function clearSessions(){
    Session.set('tockenId', '')
    Session.set('tokenForm', '')
    Session.set('custCard', '')
    Session.set('custId', '')
    Session.set('totalDonated', '')
    Session.set('followingResult', '')
    Session.set('followingResultPlus', '')
    Session.set('followerResult', '')
    Session.set('followerResultPlus', '')
    Session.set('activity', '')
  }
  audioInitiate = function audioInitiate(book){
    
    //var audioFile = $('#audio-container').attr('data-audio-file');
    //$("#audio").jPlayer('destroy')
    //console.log(Session.get("audioFile"))
    if(Session.get("audioFile")){
      $("#audio").jPlayer({
        ready: function (event) {
            $(this).jPlayer("setMedia", {
              mp3: Session.get("audioFile")
            });
        },
        ended: function() {
          if(book == 'demo'){
            $('.tour-container .continue').fadeIn().css('display', 'block');
          }else{
            Meteor.call('audioComplete', Session.get("chapterNum"), Session.get("totalVerses"), Session.get("bookName"), function(error, result){
              if(result){
                if(Session.get("questionVerseSelect") == 'Questions' && window.innerWidth <= 1200){
                  $('.question-container-right').width($('#chapters-right').width() - 55)
                }
              }
            })
            $('#complete-badge, #chapter-title').addClass('complete')
            $('#complete-badge').html('Audio complete')
            
          }
          
        },
        swfPath: "/js/Jplayer.swf",
        supplied: "mp3"
      });

      $.jPlayer.timeFormat.padMin = false;
    }
  }

  animateCoin =  function animateCoin(){
    if($('.audio-coin').hasClass('underMaxCoins')){
      var coin = $('.audio-coin b')
      var newCoin = '<div class="newCoin"></div>';

      $('body').append(newCoin)
      $('.newCoin').css({
        top: coin.offset().top,
        left: coin.offset().left,
      })

      coin.hide()
      $('.audio-coin em').show()

      var coinLocation = $('.total-points .coin')
      var locationLeft = coinLocation.offset().left;
      var locationTop = coinLocation.offset().top +20;

      $('.newCoin').animate({
        opacity: 0,
        left: locationLeft,
        top: locationTop
      }, 1000, function() {
        coin.fadeIn('slow', function() {
           $('.audio-coin em').hide()
          $('.newCoin').remove()
        });
      });
    }
    
    
  }

  inArray = function inArray(needle, haystack) {
      var length = haystack.length;
      for(var i = 0; i < length; i++) {
          if(haystack[i] == needle) return true;
      }
      return false;
  }

  addAudioCoins = function addAudioCoins(totalVerses, totalTime, bookName, chapter){
    Meteor.call('checkAudio', bookName, chapter, function(error, result){
      if(result){
        if(Session.get("verseAudioBegin") != chapter && totalTime){
          //console.log('in')
          Session.set("verseAudioBegin", chapter)
          var c = totalTime.split(':');
          var seconds = (+c[0]) * 60 + (+c[1]); 

          var verseTime = (seconds/totalVerses)
          //var coinDrop = (380/totalVerses)
          //console.log(totalTime)
          var coinLocation = new Array();
          for(var i=1;i<=totalVerses;i++){
            var location = Math.floor(verseTime*i-1)
            if(location > 20){
              location = location - 5
            }
            coinLocation[i]=location;
            //console.log(coinLocation[i])
            //var newVerseTime = (coinDrop*i)-coinDrop;
            //$('#audio-coins').prepend('<div class="audio-coin coin-'+i+'"><span></span><b></b></div>')
          }

          var oneCall = $('#oneCall').html()
          var currentState = $('#coins-remaining i strong').html();
          $("#audio").bind($.jPlayer.event.timeupdate, function(event) {
            var currentTime = Math.floor(event.jPlayer.status.currentTime)
            var matchTime = $.inArray(currentTime, coinLocation)
            if(matchTime >= 1){
              $('#oneCall').html(matchTime);
              if ($('#oneCall').html() != oneCall) {
                currentState++
                //console.log(currentState)
                //$('#coins-remaining i strong').html(currentState)
                animateCoin()
                var t=setTimeout(function(){
                  Meteor.call('audioPoints', bookName, chapter)
                  //Meteor.call('writeCoin', bookName, chapter)
                },750)
              }
              oneCall = $('#oneCall').html()
            }
          })
        }
      }
    })
  }

  animateLargeCoin = function animateLargeCoin(quesitonId, pointsPlace){

    var coin = $('#'+quesitonId+' .points-remaining')
    var newCoin = '<div class="points-remaining-new"><span>'+pointsPlace+'</span></div>';

    $('body').append(newCoin)
    $('.points-remaining-new').css({
      top: coin.offset().top,
      left: coin.offset().left,
    })

    var coinLocation = $('.total-points .coin')
    var locationLeft = coinLocation.offset().left;
    var locationTop = coinLocation.offset().top +20;

    $('.points-remaining-new').animate({
      opacity: 0,
      left: locationLeft,
      top: locationTop
    }, 1500, function() {
      $('.points-remaining-new').remove()
    });
    
  }

  animateRemoveHeart = function animateRemoveHeart(quesitonId, heartNum){
    //console.log(quesitonId)
    //console.log(heartNum)
    var heart = $('#'+quesitonId+' .heart'+(heartNum-1))
    //console.log(heart)
    var newHeart = '<div class="heart-new"></div>';
    if(heart.length){
      $('body').append(newHeart)
      $('.heart-new').css({
        top: heart.offset().top,
        left: heart.offset().left
      })

      $('.heart-new').animate({
        opacity: 0,
        top: parseInt(heart.offset().top) + 30
      }, 500, function() {
        $('.heart-new').remove()
      });
    }
    
  }

  answerQuestion = function answerQuestion(e, bookname){
    if(bookname != 'demo'){
      var bookname = Session.get("bookName")
      var chapterNum = Session.get("chapterNum")
    }else{
      var bookname = 'demo'
      var chapterNum = 1
    }
    if(!$(e.target).hasClass('disable')){
      var allAnswers = $(e.target).parent('.answers-container').find('a')

      allAnswers.addClass('disable')
      $(e.target).parent('.answers-container').find('a').addClass('disable')
      var question = $(e.target).parent('.answers-container').attr('data-question')
      var answer = $(e.target).attr('data-answer')
      var self = $(e.target).parents('.question-container').find('.lives-remaining')
      //$(e.target).addClass('wrong-answer')
      Meteor.call('answerSelect', bookname, chapterNum, answer, question, function(error, result){
        if(result[2] != 'wrongAnswer'){
          $(e.target).addClass('correct-answer')
        }
        if(result[2] == 'completeAll'){
          $('#chapter-title, #total-complete-badge').addClass('total-complete')
          $('#complete-badge').addClass('complete').html('Audio complete')
          $('#total-complete-badge').html('Questions complete')
          var book = Books.findOne({bookName: Session.get("bookName")})
          Session.set('completeBook', '')
          if(book.totalComplete == true){
            mixpanel.track('Book complete', {'Book':Session.get("bookName")})
            loadInOverlay('overlay-content')
            Blaze.render(Template.book_complete_overlay_tmpl, $('.overlay-content')[0])
            //UI.insert(UI.render(Template.book_complete_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
            $('.overlay-content').addClass('complete-overlay')
            setTimeout(function(){$('.complete-overlay .complete-win').css({'-webkit-animation-name':'rotateIn','animation-name': 'rotateIn'})},400);
            //chestVerify(book)
          }else{
            mixpanel.track('Chapter complete', {'Book':Session.get("bookName"), 'Chapter':Session.get("chapterNum")})
            mixpanel.people.set({"Stars":Points.findOne({owner: Meteor.userId()}).stars});
            loadInOverlay('overlay-content')
            Blaze.render(Template.star_overlay_tmpl, $('.overlay-content')[0])
            //UI.insert(UI.render(Template.star_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
            $('.overlay-content').addClass('star-overlay')
            setTimeout(function(){$('.star-overlay .star-win').css({'-webkit-animation-name':'rotateIn','animation-name': 'rotateIn'})},400);
          }
        }else if(result[2] == 'newTestamentComplete'){
          mixpanel.track('New Testament complete')
          mixpanel.people.set({"Stars":Points.findOne({owner: Meteor.userId()}).stars});
          $('#chapter-title, #total-complete-badge').addClass('total-complete')
          $('#complete-badge').addClass('complete').html('Audio complete')
          $('#total-complete-badge').html('Questions complete')
          
          loadInOverlay('overlay-content')
          Blaze.render(Template.finished_overlay_tmpl, $('.overlay-content')[0])
          //UI.insert(UI.render(Template.finished_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
          $('.overlay-content').addClass('finished-overlay')
          $('.close').hide()
          setTimeout(function(){$('.finished-overlay .finished-win').css({'-webkit-animation-name':'rotateIn','animation-name': 'rotateIn'})},400);
          
        }else if(result[2] == 'wrongAnswer'){
          animateRemoveHeart(result[0], result[1])
          setTimeout(function(){allAnswers.removeClass('disable')},800);
          return false
        }
        animateLargeCoin(result[0], result[1])
        mixpanel.people.set({"Points":Points.findOne({owner: Meteor.userId()}).total});
        setTimeout(function(){allAnswers.removeClass('disable')},800);
        if(bookname == 'demo'){
          $('.complete-tour').fadeIn().css('display', 'block');
        }
      })
      
    }
  }

  ajaxChapterInfo = function ajaxChapterInfo(self) {
      //console.log(Session.get("jsonDataChapter")+' != '+self.bookName)
      //console.log('ajaxChapterInfo')
      if (Session.get("jsonDataChapter")!=self.bookName){
        //console.log('if')
        var jsonBookname = self.bookName;
        var trimmedBookname = jsonBookname.replace(" ","")
        var bookVersion = Meteor.user().profile.version
        $.ajax({
          url: "/"+bookVersion+"/"+trimmedBookname+".json",
          dataType: "json",
          beforeSend: function ( xhr ) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
          }
        }).done(function ( data ) {
          Session.set("jsonData",data);
          Session.set("jsonDataChapter",self.bookName);
          //Session.set("totalVerses", data.chapterInfo[self.chapter].verses)
          //console.log('done')
          // var verseTextRaw = data.chapterInfo[self.chapter].verseText
          // var verseTextWrap = verseTextRaw.replace(/(\d+)/g, "<strong>$1 </strong>");
          // verseText = verseTextWrap
          //Session.set("verseText", verseTextWrap)
        }).fail(function(){
          console.log('ajax chapter info if ERROR')
        });
      }
      else{
        //console.log('else')
        var jsonData = Session.get("jsonData")
        //Session.set("totalVerses", jsonData.chapterInfo[self.chapter].verses)

        // var verseTextRaw = jsonData.chapterInfo[self.chapter].verseText
        // var verseTextWrap = verseTextRaw.replace(/(\d+)/g, "<strong>$1</strong>");
        // verseText = verseTextWrap
        //Session.set("verseText", verseTextWrap)
      }
  }

  loadInOverlay = function loadInOverlay(className){
   // console.log('load')
    var windowPosition = document.body.scrollTop
    $('body').append('<div class="black-overlay"><div class="'+className+'"><a href="#" class="close">Close</a></div></div>').addClass('noScroll')
    $('.black-overlay .close').click(function(){

      $('.black-overlay, .'+className).fadeOut(200, function(){
        $('.black-overlay, .'+className).remove()
        $('body').removeClass('noScroll')
        //window.scrollTo(0,windowPosition)
      })
      return false
    })
    return false
  }

  

  trimInput = function trimInput(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }

  validateEmail = function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  } 

  progressGraph = function progressGraph(){

    Session.set('dayProgress', "")
    var currentdate = new Date()
    var month = currentdate.getMonth() + 1

    var progress = Progress.find({month: month}).fetch();
    Session.set('currentMonth', monthNames[currentdate.getMonth()])
    progress.unshift(" ")
    var day = currentdate.getDate()
    daysInMonth = new Array([],[31],[28],[31],[30],[31],[30],[31],[31],[30],[31],[30],[31])
    arrayOfData = new Array()

    //console.log(daysInMonth[month])
    for(i=1;i<=daysInMonth[month];i++){
      arrayZ = new Array(0,i);
      arrayOfData.push(arrayZ)
    }

    for(i=1;i<=day;i++){
      if(i<progress.length){
        var fullDate = String(progress[i].date)
        var trimDate = progress[i].day
        var trimMonth = progress[i].month
        //console.log(trimDate+" "+trimMonth)
        if(trimMonth == month){
          arrayOfData[parseInt(trimDate)-1] = [progress[i].progress, arrayOfData[parseInt(trimDate)-1][1]]
        }
        
        if(trimDate == day){
          Session.set('dayProgress', progress[i].progress)
        }
      }
      
      if(!Session.get('dayProgress')){
        Session.set('dayProgress', 0)
      }

    }
    //console.log(arrayOfData)
      $('#bar-graph').jqBarGraph({ data: arrayOfData, width: 1020, barSpace: 15, height:165, color:'#26a6d1' });
      $('#bar-graph .graphLabelbar-graph').each(function(){
        if($(this).html() == day){
          $(this).parent().addClass('today')
        }
      })
  }

  preload = function preload(arrayOfImages) {
      $(arrayOfImages).each(function(){
          $('<img/>')[0].src = this;
      });
      //console.log('Preloaded')
  }

  search = function search(searchVal){
    searchVal = searchVal.replace(/\%20/g, ' ').replace(/[*|&;$%@"<>()+,]/gi, '')
    if(Backbone.history.fragment != "search"){
      //Spark.finalize($("#site-container")[0])
      $("#site-container").empty()
      Blaze.render(Template.search_user_tmpl, $('#site-container')[0])
      //UI.insert(UI.render(Template.search_user_tmpl), document.getElementById('site-container'))
      Router.navigate("/search?q="+searchVal)
      $('#user-input-search').val(searchVal)
    }
    
    Session.set('userSearchLoaded', false)

    Session.set('userSearchQuery', searchVal)
    if(searchVal){
      Meteor.call('searchUser', searchVal, function (error, result) {
        Session.set('userSearchCount', result.length)
        Session.set('userSearchResult', result)
        Session.set('userSearchLoaded', true)
      })
    }else{
      Session.set('userSearchCount', '0')
      Session.set('userSearchResult', false)
      Session.set('userSearchLoaded', true)
    }
    $('html,body').scrollTop(0);
  }

  popupBubble = function popupBubble(target, content, topBar){
    if($('.popup-bubble').length < 1){
      var position = target.offset()
      $('body').append('<div class="popup-bubble">'+content+'<div class="arrow"></div></div>')
      var bubbleHeight = $('.popup-bubble').height() + 18
      var bubbleWidth = $('.popup-bubble').width() + 14
      
      if(target.css("border-left-width")){
        var add = target.css("border-left-width").replace('px', '')
        bubbleWidth = bubbleWidth - parseInt(add)
      }

      if(target.css("border-right-width")){
        var add = target.css("border-right-width").replace('px', '')
        bubbleWidth = bubbleWidth - parseInt(add)
      }

      
      if((position.left + (bubbleWidth/2))>window.innerWidth){
        var bubbleOffsetLeft = -(bubbleWidth - target.width())
        $('.popup-bubble').addClass('off')
        $('.popup-bubble.off .arrow').css({'right':(target.width()/2)-5})
      }else{
        var bubbleOffsetLeft = (target.width() - bubbleWidth)/2
      }
      if(topBar){
        $('.popup-bubble').addClass('top')
        $('.popup-bubble').css({'top':'55px', 'left':position.left - (bubbleWidth/2) + 10, 'display': 'block', 'opacity': '0', 'position':'fixed'})
        $('.popup-bubble').animate({
          top: '+=3',
          opacity: 1
        }, 200)
      }else{
        $('.popup-bubble').css({'top':position.top - bubbleHeight, 'left':position.left + bubbleOffsetLeft, 'display': 'block', 'opacity': '0'})
        $('.popup-bubble').animate({
          top: '+=3',
          opacity: 1
        }, 200)
      }
      
    }
    
  }



  listAllCharges = function listAllCharges(){
    Meteor.call('listCharges', function (error, result){
      //console.log(result)
      var amount = 000;
      if(result){
        var dates = new Array()
        
        for (var i=0; i<=result.data.length-1; i++){
          //console.log(result.data[i])
          if(result.data[i].paid){
            amount = amount + result.data[i].amount
          }
          
          var created = result.data[i].created
          var date = new Date(created * 1000);
          result.data[i].created = monthNames[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()
          result.data[i].amount = String(result.data[i].amount).replace(/([0-9][0-9])$/, ".$1")
        }
        Session.set('listCharges',result.data)
        
      }

      Session.set('totalDonated',amount)
      
    })
    //console.log('Call')
  }

  isMyScriptLoaded = function isMyScriptLoaded(url) {
      if (!url) url = "http://widget.uservoice.com/IDaui0jyJUpmVFn7PYrNg.js";
      scripts = document.getElementsByTagName('script');
      for (var i = scripts.length; i--;) {
          if (scripts[i].src == url) return true;
      }
      return false;
  }

  removeUserVoice = function removeUserVoice(){
    $('script').each(function(){
        if($(this).attr('src')){
            var srcName = $(this).attr('src')
            if(srcName.indexOf('uservoice.com') > 0){
              $(this).remove()
            }
        }
    })
    $('.uv-icon').remove()
  }

  stripeResponseHandler = function stripeResponseHandler(status, response) {
    var $form = $(Session.get('tokenForm'))
    if (response.error) {
      //console.log('Show the errors on the form') 
      mixpanel.track('Donation page',{'Step':'Card info error: '+response.error.message})
      $form.find('.payment-errors').text(response.error.message);
      $form.find('.submit-payment, .save-card').show();
      $form.find('.form-load').hide();

    } else {
      //console.log('token contains id, last4, and card type')
      mixpanel.track('Donation page',{'Step':'Submit card info'})
      var token = response.id;
      Session.set('tockenId', token)
      
      
      //console.log('Insert the token into the form so it gets submitted to the server')
      $form.append($('<input type="hidden" name="stripeToken" id="tokenId" />').val(token));
      //console.log('and submit')
      $(Session.get('tokenForm')+' #form-complete').click()
      
      //$form.submit();
    }
  };


  FacebookInviteFriends = function FacebookInviteFriends(){
    FB.ui({ method: 'apprequests', message: 'Invite your friends to Verses'});
  }

  emailVerified = function emailVerified(){
    //$('.email-verified').delay(4000).animate({'margin-top': '-42px', 'opacity': '0'}, 500, function(){Session.set('verEmailSent', false)})
  }

  tourResize = function tourResize(){
    windowWidth = window.innerWidth
    if(window.innerWidth < 600){
      var progressWidth = $('#jp_container_1').width() - 135
      $('.jp-progress').width(progressWidth)
      $('.question-container-right').width($('.question-container').width() - 55)
    }
  }

  windowLoad = function windowLoad(){
    windowWidth = window.innerWidth
    if(window.innerWidth > 900){
      var chapterRightWidth = $('#logged-in-container').width() - 280
      var questionWidth = chapterRightWidth
      var progressWidth = chapterRightWidth - 295
    }else if(window.innerWidth <= 900 && window.innerWidth > 600){
      var chapterRightWidth = $('#logged-in-container').width()
      var questionWidth = chapterRightWidth
      var progressWidth = chapterRightWidth - 295
    }else if(window.innerWidth <= 600){
      var progressWidth = $(window).width() - 140
      var questionWidth = $('#logged-in-container').width()
    }
    
    $('#chapters-right').width(chapterRightWidth)
    $('#chapter-title-right').width(chapterRightWidth - 160)
    $('.question-container-right').width(questionWidth - 55)
    $('.jp-progress').width(progressWidth)
  }
  
  windowResize = function windowResize(){
    if(window.innerWidth != windowWidth){
      windowWidth = window.innerWidth
      if(window.innerWidth > 900){
        var chapterRightWidth = $('#logged-in-container').width() - 280
        var questionWidth = chapterRightWidth
        var progressWidth = chapterRightWidth - 295
      }else if(window.innerWidth <= 900 && window.innerWidth > 600){
        var chapterRightWidth = $('#logged-in-container').width()
        var questionWidth = chapterRightWidth
        var progressWidth = chapterRightWidth - 295
      }else if(window.innerWidth <= 600){
        var progressWidth = $(window).width() - 140
        var questionWidth = $('#logged-in-container').width()
      }
      
      $('#chapters-right').width(chapterRightWidth)
      $('#chapter-title-right').width(chapterRightWidth - 160)
      $('.question-container-right').width(questionWidth - 55)
      if(window.chrome){
        $('#audio-container #jp_container_1').hide()
        setTimeout(function(){
            $('.jp-progress').width(progressWidth)
        },500);
        setTimeout(function(){
            $('#audio-container #jp_container_1').show(0)
        },800);
      }else{
        $('.jp-progress').width(progressWidth)
      }
    }
  }

  activityResize = function activityResize(){
    if(window.innerWidth <= 500){
      var containerWidth = $('#right-container').width() - 88
    }else{
      var containerWidth = $('#right-container').width() - 95
    }
    $('#activity .activity-container').width(containerWidth)

  }

  sideMenuOpen = function sideMenuOpen(){
    sideItemMenuClose(true)
    $('.site-cover').show()
    $('body').addClass('noScroll')
    $('header').after('<div class="left-menu"></div>')
    Blaze.render(Template.mobile_menu_tmpl, $('.left-menu')[0])
    //UI.insert(UI.render(Template.mobile_menu_tmpl), document.getElementsByClassName('left-menu')[0])
    $('.left-menu').animate({'left': '0px'})
  }

  sideMenuClose = function sideMenuClose(cover){
    $('.left-menu').animate({'left': '-250px'}, 500, function() {
      if(!cover){
        $('.site-cover').hide()
        $('body').removeClass('noScroll')
      }
      $('.left-menu').remove()
    });
  }

  sideItemMenuOpen = function sideItemMenuOpen(){
    sideMenuClose(true)
    $('.site-cover').show()
    $('body').addClass('noScroll')
    $('header').after('<div class="left-item-menu"></div>')
    Blaze.render(Template.item_dropdown_tmpl, $('.left-item-menu')[0])
    //UI.insert(UI.render(Template.item_dropdown_tmpl), document.getElementsByClassName('left-item-menu')[0])
    $('.left-item-menu').animate({'left': '0px'})
  }

  sideItemMenuClose = function sideItemMenuClose(cover){
    $('.left-item-menu').animate({'left': '-250px'}, 500, function() {
      if(!cover){
        $('.site-cover').hide()
        $('body').removeClass('noScroll')
      }
      $('.left-item-menu').remove()
    });
  }

  toggleMenus = function toggleMenus(e, menu){
    if($(e.currentTarget).hasClass('open') || menu == 'both'){
      $('.mobile-menu').removeClass('open').addClass('closed')
      $('.store-container-mobile #item-store').removeClass('open').addClass('closed')
    }else{
      if($('.mobile-menu').hasClass('closed') && $('.store-container-mobile #item-store').hasClass('closed')){
        if(menu == 'main-menu'){
          $('.mobile-menu').toggleClass('open closed')
        }else if(menu == 'item-menu'){
          //console.log('toggle item store')
          $('.store-container-mobile #item-store').toggleClass('open closed')
        }
      }else{
        if(menu == 'both'){
          $('.mobile-menu').removeClass('open').addClass('closed')
          $('.store-container-mobile #item-store').removeClass('open').addClass('closed')
        }else{
          $('.mobile-menu').toggleClass('open closed')
          $('.store-container-mobile #item-store').toggleClass('open closed')
        }
      }
    }
    
      
  }

  loadingPage = function loadingPage(){
    Session.set('loaded', false);
    $('body').addClass('noScroll')
    setTimeout(function(){pageLoaded()},10000);
  }

  pageLoaded = function pageLoaded(){
    Session.set('loaded', true);
    $('body').removeClass('noScroll')
  }

  confirmSlideup = function confirmSlideup(e){
    $('.item-store-drop .item').removeClass('selected')
    $('.confirm-container').slideUp("fast")
    if(e){
      $(e.currentTarget).closest('li').find('a strong').prepend('<p class="confirmed"></p>')
      $('p.confirmed').delay(1000).fadeOut(500, function(){
        $('p.confirmed').remove()
      })
    }
  }

  chestVerify = function chestVerify(self){
    var selfChest = self
    Session.set('chestBookName', self.bookName)
      Meteor.call('chestVerify', self, function (error, result) { 
        if(result[1] == true){
          loadInOverlay('chest-content')
          Blaze.render(Template.chest_overlay_tmpl, $('.chest-content')[0])
          //UI.insert(UI.render(Template.chest_overlay_tmpl), document.getElementsByClassName('chest-content')[0])
          
          Blaze.renderWithData(Template.first_chest_tmpl, {
            chestTmpl1: result[2][0] == 1 ? true : false,
            chestTmpl2: result[2][0] == 2 ? true : false,
            chestTmpl3: result[2][0] == 3 ? true : false,
            chestTmpl4: result[2][0] == 4 ? true : false,
            chestTmpl5: result[2][0] == 5 ? true : false,
            chestTmpl6: result[2][0] == 6 ? true : false,
            chestTmpl7: result[2][0] == 7 ? true : false,
            chestTmpl8: result[2][0] == 8 ? true : false,
            chestTmpl9: result[2][0] == 9 ? true : false,
            chestTmpl10: result[2][0] == 10 ? true : false,
            chestTmpl11: result[2][0] == 11 ? true : false
          }, document.getElementsByClassName('first-choice')[0])

          Blaze.renderWithData(Template.second_chest_tmpl, {
            chestTmpl1: result[2][1] == 1 ? true : false,
            chestTmpl2: result[2][1] == 2 ? true : false,
            chestTmpl3: result[2][1] == 3 ? true : false,
            chestTmpl4: result[2][1] == 4 ? true : false,
            chestTmpl5: result[2][1] == 5 ? true : false,
            chestTmpl6: result[2][1] == 6 ? true : false,
            chestTmpl7: result[2][1] == 7 ? true : false,
            chestTmpl8: result[2][1] == 8 ? true : false,
            chestTmpl9: result[2][1] == 9 ? true : false,
            chestTmpl10: result[2][1] == 10 ? true : false,
            chestTmpl11: result[2][1] == 11 ? true : false
          }, document.getElementsByClassName('second-choice')[0])

          Blaze.renderWithData(Template.third_chest_tmpl, {
            chestTmpl1: result[2][2] == 1 ? true : false,
            chestTmpl2: result[2][2] == 2 ? true : false,
            chestTmpl3: result[2][2] == 3 ? true : false,
            chestTmpl4: result[2][2] == 4 ? true : false,
            chestTmpl5: result[2][2] == 5 ? true : false,
            chestTmpl6: result[2][2] == 6 ? true : false,
            chestTmpl7: result[2][2] == 7 ? true : false,
            chestTmpl8: result[2][2] == 8 ? true : false,
            chestTmpl9: result[2][2] == 9 ? true : false,
            chestTmpl10: result[2][2] == 10 ? true : false,
            chestTmpl11: result[2][2] == 11 ? true : false
          }, document.getElementsByClassName('third-choice')[0])

         
          if(result[0] != 0){
            $('.chest-content .subtitle').html('Reward chosen')
            $('.choice').addClass('complete')
            $('.choice').each(function(){
              if($(this).find('.choose-item').attr('data-item-num') == result[0]){
                $(this).addClass('active')
                $(this).find('.choose-item').html('Chosen').removeClass('gray-gradient').addClass('chosen')
              }
            })
          }
          Session.set("chapterID", selfChest._id)
        }else{
          loadInOverlay('chest-error')
          $('.chest-error').empty()
          Blaze.render(Template.chest_error_overlay_tmpl, $('.chest-error')[0])
          //UI.insert(UI.render(Template.chest_error_overlay_tmpl), document.getElementsByClassName('chest-error')[0])
        }
        
      })
  }

  landingPieChart = function landingPieChart(one,two,three,four){
    var chart1 = window.chart = $('.chart.one').data('easyPieChart');
    var chart2 = window.chart = $('.chart.two').data('easyPieChart');
    var chart3 = window.chart = $('.chart.three').data('easyPieChart');
    var chart4 = window.chart = $('.chart.four').data('easyPieChart');
    chart1.update(one);
    chart2.update(two);
    chart3.update(three);
    chart4.update(four);
    $('.counter').countTo();
  }

  percentChart = function percentChart(){
    $('.chart').easyPieChart({
        barColor: '#5fcf80',
        scaleColor: false,
        lineCap: 'butt',
        trackColor: '#e5e5e5',
        lineWidth: 45,
        size: 190
    });
    $('.counter').countTo();
  }

  //------------ Functions End ------------//

