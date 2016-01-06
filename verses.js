if (Meteor.isClient) {
  var bookColors = ['#e2574c', '#3db39e', '#efc75e', '#2394bc', '#54c975', '#b34967', '#f9845b', '#556b7c', '#53bbb4', '#e15258', '#773053', '#665885', '#bbde66', '#ea4c89', '#b34949', '#2ea5b0', '#d7b344', '#bd3e80', '#ef985e', '#c84d4d', '#6aaec6', '#e6d549', '#479a52', '#8c4f60', '#c792c1', '#7eba66', '#6397a6']
  var bookIds = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb', 'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev']

  Session.setDefault('ready', false)

  Meteor.subscribe( "books_db", function() {})
  Meteor.subscribe( "streak_db", function() {})
  Meteor.subscribe( "gifts_db", function() {})
  Meteor.subscribe( "chests_db", function() {})
  Meteor.subscribe( "chestItems_db", function() {})
  Meteor.subscribe( "points_db", function() {})
  Meteor.subscribe( "notification_db", function() {})
  Meteor.subscribe( "progress_db", function() {})
  var chaptersReady = Meteor.subscribe( "chapters_db", function() {})
  Meteor.subscribe( "questions_db", function() {})
  Meteor.subscribe( "emailList_db", function() {})
  Meteor.subscribe( "following_db", function() {})
  Meteor.subscribe( "followers_db", function() {})
  Meteor.subscribe( "donations_db", function() {})
  Meteor.subscribe( "activity_db", function() {})
  //Meteor.subscribe("userdata", function() {});
  Session.set('userCount', Meteor.users.find().count())

  Meteor.startup( function() {
      filepicker.setKey("AaMxd4HMjRK2gsK9GLmEXz");
      Stripe.setPublishableKey('pk_live_oGOE112l6Mu0uMADvi6QnIrr');
      $(function(){
        var os = navigator.platform.toLowerCase();
        if( os.indexOf('mac') != -1){
          $('body').addClass('mac');
        }

        $('body, html').click(function(){
          $('.profile-contain ul, ul.store-container li ul.item-store-drop').hide()
        })
      })
       FB.init({ 
         appId:'1387339228187004', 
         cookie:true, 
         status:true, 
         xfbml:true 
       });
  });

  Template.outer_tmpl.helpers({
    loaded: function () {
      return Session.get('loaded')
    },
    shopNotification: function () {
      var notifications = Notification.find({owner: Meteor.userId(), type: 'shop', seen: false})
      if(notifications){
        return notifications.count()
      }
    },
    avatar: function () {
      var imagePath = Meteor.users.findOne({_id:Meteor.userId()})
      Session.set("avatarUrl", imagePath.profile.avatar)
      return "https://s3.amazonaws.com/versesavatars/"+imagePath.profile.avatar
    }
  });

  Template.landing_outer_tmpl.helpers({
    loaded: function () {
      return Session.get('loaded')
    }
  });

  Template.landing_tmpl.helpers({
    scroll: function () {
      var showNav = false;

      $.fn.isOnScreen = function(){
      
          var win = $(window);
          
          var viewport = {
              top : win.scrollTop(),
              left : win.scrollLeft()
          };
          viewport.right = viewport.left + win.width();
          viewport.bottom = viewport.top + win.height();
          
          var bounds = this.offset();
          bounds.right = bounds.left + this.outerWidth();
          bounds.bottom = bounds.top + this.outerHeight();
          
          return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
          
      };

      $(window).scroll(function () {
          var scrollTop = $(window).scrollTop()
          if(scrollTop >= '600' && !showNav){
              $('header').removeClass('landing-header').css({'top':'-50px'})
              $('header').animate({
                  top: 0
              })
              showNav = true
          }else if(scrollTop =='0' && showNav){
              $('header').addClass('landing-header').removeAttr('style')
              showNav = false
          }
      })
    }
  });

  Template.landing_tmpl.onRendered(function () {
    $('.chart').easyPieChart({
        barColor: '#3b89c1',
        scaleColor: false,
        lineCap: 'butt',
        trackColor: '#e5e5e5',
        lineWidth: 30,
        size: 170
    });
    var visible = false;
    if($('.chart').isOnScreen()){
      landingPieChart(20,61,18,9)
      visible = true
    }else{
      $(window).scroll(function () {
        if(!visible){
          if($('.chart').isOnScreen()){
            landingPieChart(20,61,18,9)
            mixpanel.track('Landing view chart')
            visible = true
          }
        }
        
      })
    }
  });

  Template.total_points_tmpl.helpers({
    points: function () {
      Meteor.call('checkPoints')
      if(Meteor.userId()){
        var points = Points.findOne({owner: Meteor.userId()}).total
        return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      }
    }
  });

  Template.total_streak_tmpl.helpers({
    streak: function () {
      var date = new Date();
      var offset = date.getTimezoneOffset() * 60 * 1000
      Meteor.call('initialStreak', offset)
      if(Meteor.userId()){
        var streak = Streak.findOne({owner: Meteor.userId()}).days
        return streak
      }
    }
  });

  Template.total_chapters_complete_tmpl.helpers({
    stars: function () {
      return Points.findOne({owner: Meteor.userId()}).stars
    }
  });

  Template.chapters_tmpl.helpers({
    books: function () {
      Meteor.subscribe( "books_db", function() {Meteor.call('createBooks');})
      return Books.find({owner: Meteor.userId(), bookName:{$ne: 'demo'}},{sort: {bookNum: 1}}).fetch();
    },
    gifts: function () {
      return Gifts.find({owner: Meteor.userId()}).fetch();
    },
    chests: function () {
      return Chests.find({owner: Meteor.userId()}).fetch();
    },
    progressPercent: function () {
      var percentage = Math.floor(parseInt(this.chaptersComplete) * 100 / parseInt(this.chapters))
      if(percentage<=100){
       return percentage 
      }
      else{
        return '100'
      }
    },
    suggestedBook: function () {
      Meteor.subscribe("userdata", function() {
        if(Meteor.user().profile.bookSuggest){
          var trimmed = Meteor.user().profile.bookSuggest.replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
          Session.set('suggestedBook', trimmed)
        }else{
          Session.set('suggestedBook', 'Matthew')
        }
      })
      return Session.get('suggestedBook')
    },
    suggestedBookLink: function () {
      Meteor.subscribe("userdata", function() {
        if(Meteor.user().profile.bookSuggest){
          var trimmed = Meteor.user().profile.bookSuggest.replace(' ', '')
          Session.set('suggestedBookLink', trimmed)
        }else{
          Session.set('suggestedBookLink', 'Matthew')
        }
      })
      return Session.get('suggestedBookLink')
    },
    progressTotalPercent: function () {
      var percentage = Math.floor(parseInt(this.chaptersTotalComplete) * 100 / parseInt(this.chapters))
      if(percentage<=100){
       return percentage 
      }
      else{
        return '100'
      }
    },
    backgroundColor: function () {
      return bookColors[bookNames.indexOf(this.bookName)]
    },
    bookNameTrim: function () {
      var trimmed = this.bookName.replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
      return trimmed
    },
    chapterGrammer: function () {
      if(this.chapters > 1){
        return 'chapters'
      }else{
        return 'chapter'
      }
    },
    completeBooks: function () {
      var complete = Books.find({owner: Meteor.userId(), totalComplete: true}).count()
      var more = true
      if(complete==1){
        more = false
      }
      return {'complete':complete, 'more': more}
    },
    bookCoinsEarned: function () {
      return this.bookCoinsEarned.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    prevChapters: function () {
      var prevBook = this.bookNum - 1;
      var book = Books.findOne({owner: Meteor.userId(), bookNum:prevBook})
      var chapters = book.chapters - book.chaptersTotalComplete
      return chapters
    },
    prevBookname: function () {
      var prevBook = this.bookNum - 1;
      var bookName = Books.findOne({owner: Meteor.userId(), bookNum:prevBook}).bookName
      return bookName
    }
  });

  Template.book_unlock_overlay_tmpl.helpers({
    bookName: function () {
      return Session.get('unlockBookname')
    },
    bookNameTrim: function () {
      return Session.get('unlockBookname').replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
    },
    starsAvailable: function () {
      var starsAvailable = Points.findOne({owner: Meteor.userId()})
      if(starsAvailable.stars >= Session.get("unlockStars")){
        return true
      }else{
        return false
      }
    },
    stars: function () {
      return Session.get('unlockStars')
    },
    starsGrammar: function () {
      if(Session.get('unlockStars') > 1){
        var starsGrammar = 'stars'
      }else{
        var starsGrammar = 'star'
      }
      return starsGrammar
    }
  });

  Template.chapters_tmpl.onRendered(function () {
    if (!this.rendered){
       Meteor.subscribe("userdata", function() {
        if(Meteor.user().profile.newUser == true && $('.overlay-content').length != 1){
          $('.book-details-bubble').remove()
          loadInOverlay('overlay-content')
          Blaze.render(Template.tour_tmpl, $('.overlay-content')[0])
          //UI.insert(UI.render(Template.tour_tmpl), document.getElementsByClassName('overlay-content')[0])
          $('.overlay-content').addClass('tour-container')
          $('.overlay-content .close').remove()

          $( window ).resize(function() {
            tourResize()
          });
        }
       })
    }
  });

  Template.tour_step2_tmpl.onRendered(function () {
    tourResize()
  });

  Template.tour_step2_tmpl.helpers({
    underMaxCoins: function () {
      var chapter = Chapters.findOne({chapter: 1, bookName: 'demo', owner: Meteor.userId()});
      if(chapter.coinsAccumulated < chapter.verses){
        return true
      }
    },
    coinsAccumulated: function () {
      var chapter = Chapters.findOne({chapter: 1, bookName: 'demo', owner: Meteor.userId()})
      ajaxChapterInfo(chapter)
      return Chapters.findOne({chapter: 1, bookName: 'demo', owner: Meteor.userId()}).coinsAccumulated;
    }
  });

  Template.tour_step3_tmpl.helpers({
    questionData: function () {
      var question = Questions.findOne({bookName: 'demo', chapter: 1, owner: Meteor.userId()})
      return question
    },
    questionTitle: function () {
      return Session.get("jsonData").questionInfo[1].questions[1]
    },
    answers: function () {
      var answers = Session.get("jsonData").questionInfo[1].answers[1]
      var answerKeys = new Array()
      for(var i=0;i<answers.length;i++){
        answerKeys.push({
          key: i+1,
          value: answers[i]
        })
      }
      return answerKeys
    },
    heart: function () {
      var livesRemain = new Array();
      for(var i=1;i<=this.lives; i++){
        livesRemain[i] = i
      }
      return livesRemain
    }
  });

  Template.tour_step3_tmpl.onRendered(function () {
    tourResize()
    if (!this.rendered){
      $('.complete-true .answers-container').each(function(){
        if($(this).attr('data-answer')){
          var answer = $(this).attr('data-answer')
          $(this).find('.answer'+answer).addClass('correct-answer')
          $('.complete-tour').fadeIn().css('display', 'block');
        }
      })
      this.rendered = true;
    }
  });

  Template.single_chapter_tmpl.helpers({
    chapterPull: function () {
      var chapterPull = Chapters.findOne({bookName: Session.get("bookName"), chapter:Session.get("chapterNum"), owner: Meteor.userId()});
      return chapterPull
    },
    underMaxCoins: function () {
      var chapter = Chapters.findOne({chapter: Session.get("chapterNum"), bookName: Session.get("bookName"), owner: Meteor.userId()});
      if(ChestItems.findOne({owner: Meteor.userId(), unlimitedAudio:{"$exists":true}}) || chapter.coinsAccumulated < chapter.verses){
        return true
      }
    }
  });

  Template.audio_tmpl.helpers({
    audioFile: function () {
      return Session.get("audioFile")
    }
  });

  Template.book_tmpl.helpers({
    chapterCount: function () {
      return Chapters.find({owner: Meteor.userId(), bookName:Session.get("bookName")}, {sort: {chapter: 1}});
    },
    selected: function () {
      if(this.chapter == Session.get("chapterNum")){
        return true
      }
    },
    bookName: function () {
      return Session.get("bookName")
    },
    bookNameTrimmed: function () {
      return Session.get("bookName").replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
    },
    backgroundColor: function () {
      return Session.get("backgroundColor")
    },
    unlocked: function () {
     return Books.findOne({owner: Meteor.userId(), bookName:Session.get("bookName")}).unlocked;
    }
  });

  Template.streak_tmpl.helpers({
    streak: function () {
      // var streak = Streak.findOne({owner: Meteor.userId()}, {reactive: false})
      var date = new Date();
      var offset = date.getTimezoneOffset() * 60 * 1000
      // var streakDate = streak.date.getDate();
      // if(streakDate != currentDate && !streak.used){
      //   //console.log(streakDate+" != "+currentDate)
        Meteor.call('streakUpdate', offset, function(error, result){
          if(result){
            Session.set('streakTrue', result)
          }
          
        })
      //}
      return Session.get('streakTrue')
    }
  });

  Template.star_overlay_tmpl.helpers({
    bookName: function () {
      Session.set('streakTrue')
      return Session.get("bookName")
    },
    isEnd: function () {
      if(Session.get("chapterNum") == Session.get("chapters")){
        if(Session.get("bookName") == 'Revelation'){
          return 'Close'
        }else{
          return 'Next book'
        }
      }else{
        return 'Next chapter'
      }
    }
  });

  Template.book_complete_overlay_tmpl.helpers({
    bookName: function () {
      return Session.get("bookName")
    },
    bookNameRep: function () {
      return Session.get("bookNameRep")
    }
  });

  Template.questions_verses_btns.helpers({
    questionSelected: function () {
      if(Session.get("questionVerseSelect") == 'Questions'){
        return true;
      }
    },
    verseSelected: function () {
      if(Session.get("questionVerseSelect") == 'Verses' || Session.get("questionVerseSelect") == null){
        return true;
      }
    },
    numQuestionsRemain: function () {
      var numQuestions = Chapters.findOne({owner: Meteor.userId(), bookName:Session.get("bookName"), chapter: Session.get("chapterNum")});
      var remain = 3 - parseInt(numQuestions.correctAnswers)
      return remain
    },
    questionsComplete: function () {
      var questionsComplete = Chapters.findOne({owner: Meteor.userId(), bookName:Session.get("bookName"), chapter: Session.get("chapterNum")});
      return questionsComplete.totalComplete
    }
  });

  Template.questions_verses_btns.onRendered(function () {
    if (!this.rendered){
      if(Session.get("questionVerseSelect") == 'Verses' || !Session.get("questionVerseSelect")){
        $("#questions-verses-container").empty()
        Blaze.render(Template.verses_tmpl, $('#questions-verses-container')[0])
        //UI.insert(UI.render(Template.verses_tmpl), document.getElementById('questions-verses-container'))
      }
      else if(Session.get("questionVerseSelect") == 'Questions'){
        $("#questions-verses-container").empty()
        Blaze.render(Template.questions_tmpl, $('#questions-verses-container')[0])
        //UI.insert(UI.render(Template.questions_tmpl), document.getElementById('questions-verses-container'))
      }
    }
  });

  Template.chest_items_tmpl.helpers({
    item: function () {
      return ChestItems.find({owner: Meteor.userId()}).fetch()
    }
  });

  Template.verses_tmpl.helpers({
    verseText: function () {
      return Session.get('verseText')
    },
    verseTextLoaded: function () {
      return Session.get("verseTextLoaded")
    }
  });

  Template.questions_tmpl.helpers({
    questionData: function () {
      Meteor.call('questionsInitialize', Session.get("chapterNum"), Session.get("bookName"))
      return Questions.find({bookName: Session.get("bookName"), chapter: Session.get("chapterNum"), owner: Meteor.userId()})
    },
    pointsRemaining: function () {
      var points = this.pointsRemaining
      if(ChestItems.findOne({owner: Meteor.userId(), doubler:{"$exists":true}}) && !this.complete){
        points = points * 2
      }else if(this.complete){
        points = this.pointsAquired
      }
      return points
    },
    questionTitle: function () {
      return Session.get("jsonData").questionInfo[Session.get("chapterNum")].questions[this.question]
    },
    answers: function () {
      var answers = Session.get("jsonData").questionInfo[Session.get("chapterNum")].answers[this.question]
      var answerKeys = new Array()
      for(var i=0;i<answers.length;i++){
        answerKeys.push({
          key: i+1,
          value: answers[i]
        })
      }
      return answerKeys
    },
    didYouKnow: function () {
      if(Session.get("jsonData").questionInfo[Session.get("chapterNum")].didYouKnow[this.question] != ""){
        return Session.get("jsonData").questionInfo[Session.get("chapterNum")].didYouKnow[this.question]
      }
    },
    heart: function () {
      var livesRemain = new Array();
      for(var i=0;i<=this.lives-1; i++){
        livesRemain[i] = i
      }
      return livesRemain
    },
    audioComplete: function () {
      var audioComplete = Chapters.findOne({bookName: Session.get("bookName"), chapter: Session.get("chapterNum"), owner: Meteor.userId()})
      if(ChestItems.findOne({owner: Meteor.userId(), questionView:{"$exists":true}})){
        return true
      }else if(audioComplete.complete && audioComplete.coinsAccumulated >= audioComplete.verses){
        return true
      }
    },
    recycler: function () {
      if(ChestItems.findOne({owner: Meteor.userId(), recycler:{"$exists":true}})){
        return true
      }
    },
    specialLives: function () {
      if(ChestItems.findOne({owner: Meteor.userId(), lifeUpgrade:{"$exists":true}})){
        return true
      }
    },
    chapter: function () {
      var chapter = Chapters.findOne({bookName: Session.get("bookName"), chapter: Session.get("chapterNum"), owner: Meteor.userId()})
      return chapter
    },
    coinComplete: function () {
      if(this.coinsAccumulated >= this.verses){
        return true
      }
    }
  });

  Template.questions_verses_btns.helpers({
    audioComplete: function () {
      var audioComplete = Chapters.findOne({bookName: Session.get("bookName"), chapter: Session.get("chapterNum"), owner: Meteor.userId()})
      if(ChestItems.findOne({owner: Meteor.userId(), questionView:{"$exists":true}})){
        return true
      }else if(audioComplete.complete && audioComplete.coinsAccumulated >= audioComplete.verses){
        return true
      }
    }
  });

  Template.questions_tmpl.onRendered(function () {
    $('.complete-true .answers-container').each(function(){
      if($(this).attr('data-answer')){
        var answer = $(this).attr('data-answer')
        $(this).find('.answer'+answer).addClass('correct-answer')
      }
    })
    windowLoad()
  });

  Template.account_left_tmpl.helpers({
    avatar: function () {
      if(Session.get("avatarUrl")) return "https://s3.amazonaws.com/versesavatars/"+Session.get("avatarUrl")
    }
  });

  Template.account_tmpl.helpers({
    emailVerified: function () {
      return Session.get('emailVerify')
    },
    emailSent: function () {
      return Session.get('verEmailSent')
    },
    pageName: function () {
      var urlName = Backbone.history.fragment.replace('/', '')
      return urlName
    }
  });

  Template.account_left_tmpl.helpers({
    followingCount: function () {
      return Following.find({owner: Meteor.userId()}).count()
    },
    followerCount: function () {
      return Followers.find({owner: Meteor.userId()}).count()
    },
    user: function () {
      if(!Session.get('custId')){
        if(Donations.findOne({owner: Meteor.userId()})){
          Session.set('custId', Donations.findOne({owner: Meteor.userId()}).custId) 
        }
      }
      return Meteor.user()
    },
    getFollow: function () {
      var followingUsers = Following.find().fetch()
      var followerUsers = Followers.find().fetch()
      if(followingUsers.length){
        var users = new Array()
        for (var i = 0; i < followingUsers.length; i++) {
          users[i] = followingUsers[i].following
        }
        Session.set('followingList',users)
      }

      if(followerUsers.length){
        var users = new Array()
        for (var i = 0; i < followerUsers.length; i++) {
          users[i] = followerUsers[i].followers
        }
        Session.set('followerList',users)
      }
    }
  });

  Template.book_tmpl.helpers({
    chaptersLoading: function () {
      return !chaptersReady.ready()
    }
  });

  Template.email_ver_alert_tmpl.onRendered(function () {
    emailVerified()
  });

  Template.email_sent_alert_tmpl.onRendered(function () {
    emailVerified()
  });

  Template.single_chapter_tmpl.onRendered(function () {
    windowLoad()
    $( window ).resize(function() {
      windowResize()
    });
  });

  Template.single_chapter_tmpl.helpers({
    chaptersLoading: function () {
      return !chaptersReady.ready()
    },
    backgroundColor: function () {
      return Session.get('backgroundColor')
    }
  });

  Template.account_right_tmpl.helpers({
    user: function () {
      if(!Session.get('custId')){
        if(Donations.findOne({owner: Meteor.userId()})){
          Session.set('custId', Donations.findOne({owner: Meteor.userId()}).custId) 
        }
      }
      return Meteor.user()
    },
    donationsExist: function () {
      if(Donations.find({owner: Meteor.userId()}).fetch().length){
        return true
      }
    }
  });

  Template.drop_menu_tmpl.helpers({
    donationsExist: function () {
      if(Donations.find({owner: Meteor.userId()}).fetch().length){
        return true
      }
    }
  });

  Template.item_dropdown_tmpl.helpers({
    points: function () {
      return Points.findOne({owner:Meteor.userId()})
    },
    matthewComplete: function () {
      return Books.findOne({owner: Meteor.userId(), bookName: 'Matthew'}).complete
    },
    threeBooks: function () {
      var booksComplete = Books.find({owner: Meteor.userId(), complete: true}).count()
      if(booksComplete >= 3){
        return true
      }
    },
    nineBooks: function () {
      var booksComplete = Books.find({owner: Meteor.userId(), complete: true}).count()
      if(booksComplete >= 9){
        return true
      }
    },
    twelveBooks: function () {
      var booksComplete = Books.find({owner: Meteor.userId(), complete: true}).count()
      if(booksComplete >= 12){
        return true
      }
    },
    lifeExists: function () {
      var itemExists = ChestItems.findOne({owner:Meteor.userId(), item:8})
      if(itemExists){
        return true
      }
    },
    questionsExists: function () {
      var itemExists = ChestItems.findOne({owner:Meteor.userId(), item:9})
      if(itemExists){
        return true
      }
    },
    audioExists: function () {
      var itemExists = ChestItems.findOne({owner:Meteor.userId(), item:10})
      if(itemExists){
        return true
      }
    },
    enoughStarsCoin: function () {
      if(this.stars >= 5){
        return true
      }
    },
    enoughStarsRevive: function () {
      if(this.stars >= 15){
        return true
      }
    },
    enoughStarsLife: function () {
      if(this.stars >= 25){
        return true
      }
    },
    enoughStarsQuestions: function () {
      if(this.stars >= 50){
        return true
      }
    },
    enoughStarsAudio: function () {
      if(this.stars >= 75){
        return true
      }
    }
  });

  Template.mobile_menu_tmpl.helpers({
    followingCount: function () {
      return Following.find({owner: Meteor.userId()}).count()
    },
    followerCount: function () {
      return Followers.find({owner: Meteor.userId()}).count()
    }
  });

  Template.account_info_tmpl.helpers({
    profile: function () {
      return Meteor.user().profile
    },
    user: function () {
      return Meteor.user()
    },
    jsonKingBooks: function () {
      if(Meteor.user().profile.version == 'jsonKingBooks'){
        return true
      }
    },
    jsonBooks: function () {
      if(Meteor.user().profile.version == 'jsonBooks'){
        return true
      }
    }
  });

  Template.account_following_tmpl.helpers({
    ready: function () {
      if(Session.get('followingList')){
        Meteor.subscribe( "followdata", Session.get('followingList'), function() {
          Session.set('followingDataReady', true)
        })
        Meteor.subscribe( "followpoints", Session.get('followingList'), function() {})
      }
      return Session.get('followingDataReady')
    },
    user: function () {
      if(Session.get('followingList')){
        var points = Points.find({ owner: { $in: Session.get('followingList') } },{sort: { total: -1 }, limit:3})
        return points
      }
    },
    username: function () {
      return Meteor.users.findOne({ _id: this.owner }).username
    },
    avatar: function () {
      return Meteor.users.findOne({ _id: this.owner }).profile.avatar
    },
    total: function () {
      return this.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    followingOver: function () {
      var count = Points.find({ owner: { $in: Session.get('followingList') } }).count()
      if(count > 3){
        return true
      }
    },
    followingShowAll: function () {
      return Points.find({ owner: { $in: Session.get('followingList') } }).count()
    },
    publicPage: function () {
      var isPublicPage = Session.get('profileID') != Meteor.userId() ? true : false;
      return isPublicPage
    }
  });

  Template.account_follower_tmpl.helpers({
    ready: function () {
      if(Session.get('followerList')){
        Meteor.subscribe( "followdata", Session.get('followerList'), function() {
          Session.set('followerDataReady', true)
        })
        Meteor.subscribe( "followpoints", Session.get('followerList'), function() {})
      }
      return Session.get('followerDataReady')
    },
    user: function () {
      if(Session.get('followerList')){
        var points = Points.find({ owner: { $in: Session.get('followerList') } },{sort: { total: -1 }, limit:3})
        return points
      }
    },
    username: function () {
      return Meteor.users.findOne({ _id: this.owner }).username
    },
    avatar: function () {
      return Meteor.users.findOne({ _id: this.owner }).profile.avatarusernameError
    },
    total: function () {
      return this.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    followerOver: function () {
      var count = Points.find({ owner: { $in: Session.get('followerList') } }).count()
      if(count > 3){
        return true
      }
    },
    followerShowAll: function () {
      return Points.find({ owner: { $in: Session.get('followerList') } }).count()
    },
    publicPage: function () {
      var isPublicPage = Session.get('profileID') != Meteor.userId() ? true : false;
      return isPublicPage
    }
  });

  Template.account_follower_plus_tmpl.helpers({
    user: function () {
      if(Session.get('followerList')){
        var points = Points.find({ owner: { $in: Session.get('followerList') } },{sort: { total: -1 }})
        return points
      }
    },
    username: function () {
      return Meteor.users.findOne({ _id: this.owner }).username
    },
    avatar: function () {
      return Meteor.users.findOne({ _id: this.owner }).profile.avatar
    },
    total: function () {
      return this.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
  });

  Template.account_following_plus_tmpl.helpers({
    user: function () {
      if(Session.get('followingList')){
        var points = Points.find({ owner: { $in: Session.get('followingList') } },{sort: { total: -1 }})
        return points
      }
    },
    username: function () {
      return Meteor.users.findOne({ _id: this.owner }).username
    },
    avatar: function () {
      return Meteor.users.findOne({ _id: this.owner }).profile.avatar
    },
    total: function () {
      return this.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
  });

  Template.public_profile_tmpl.helpers({
    getFollow: function () {
      Meteor.subscribe( "publicfollowing", Session.get('profileID'), function() {
        var followingUsers = Following.find({owner:Session.get('profileID')}).fetch()
        if(followingUsers.length){
          var users = new Array()
          for (var i = 0; i < followingUsers.length; i++) {
            users[i] = followingUsers[i].following
          }
          Session.set('followingList',users)
        }
      })
      Meteor.subscribe( "publicfollowers", Session.get('profileID'), function() {
        var followerUsers = Followers.find({owner:Session.get('profileID')}).fetch()
        if(followerUsers.length){
          var users = new Array()
          for (var i = 0; i < followerUsers.length; i++) {
            users[i] = followerUsers[i].followers
          }
          Session.set('followerList',users)
        }
      })
    },
    user: function () {
      return Meteor.users.findOne({'_id':Session.get('profileID')})
    },
    following: function () {
      var followingUser = Following.findOne({owner: Meteor.userId(), following:Session.get('profileID')})
      if(followingUser){
        return true
      }
    },
    points: function () {
      if(Points.findOne({owner: Session.get('profileID')})){
        var points = Points.findOne({owner: Session.get('profileID')}).total
        return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      }else{
        return '0'
      }
    },
    activity: function () {
      return Activity.find({owner: Session.get('profileID')},{sort: {date: -1}, limit:10})
    },
    demo: function () {
      if(this.bookName == 'demo'){
        return true
      }
    },
    followingUser: function () {
      Meteor.subscribe("activitydata", this.activityFollowing)
      return Meteor.users.findOne({_id:this.activityFollowing})
    },
    likes: function () {
      return this.like.length
    },
    likeNames: function () {
      if(this.like.length){
        var namesString
        var self = this
        Meteor.subscribe("likedata", this.like, function(){
          for(var i=0;i<=self.like.length-1; i++){
            if(i == 0){
              Session.set('likeNameString', Meteor.users.findOne({_id:self.like[i]}).username)
            }else{
              Session.set('likeNameString', Session.get('likeNameString')+', '+Meteor.users.findOne({_id:self.like[i]}).username) 
            }
          }
        })
        return Session.get('likeNameString')
      }
    },
    chapterGrammer: function () {
      if(this.completedChapter.length > 1){
        return 'chapters'
      }else{
        return 'chapter'
      }
    },
    date: function () {
      return $.timeago(this.date)
    }
  });

  Template.public_profile_tmpl.onRendered(function () {
    activityResize()
    $( window ).resize(function() {
      activityResize()
    });
  });

  Template.progress_percent_tmpl.helpers({
    progressPercent: function () {
      Meteor.call('publicPercent', Session.get('profileID'), function(error, result){
        Session.set('publicPercent', result)
        percentChart()
      })
      return Session.get('publicPercent')
    }
  });

  Template.public_profile_tmpl.helpers({
    bookNameTrim: function () {
      if(this.bookName){
        var bookName = this.bookName
      }else{
        var bookName = this.bookComplete
      }
      var trimmed = bookName.replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
      return trimmed
    },
    badges: function () {
      var badges = Books.find({owner: Session.get('profileID'), bookName:{$ne: 'demo'}, totalComplete:true}, {fields: {'bookName': 1, 'completeDate': 1}, sort: {'completeDate': -1}}).fetch()
      return badges
    },
    bibleFinished: function () {
      if(Meteor.user().profile.finished){
        return true
      }
    },
    finishedDate: function () {
      var d = new Date(Meteor.user().profile.finishedDate);
      var curr_date = d.getDate();
      var curr_month = d.getMonth();
      var curr_year = d.getFullYear();
      
      return curr_date + " " + monthNames[curr_month] + " " + curr_year
    },
    completeDate: function () {
      if(this.completeDate){
        var d = new Date(this.completeDate);
      }else{
        var d = new Date();
      }
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();
        
        return curr_date + " " + monthNames[curr_month] + " " + curr_year 
    },
    progressData: function () {
      var bookProgress = Books.find({owner: Session.get('profileID'), bookName:{$ne: 'demo'}, bookCoinsEarned:{ $gt: 0 }},{sort: {bookCoinsEarned: -1}}).fetch()
      return bookProgress
    },
    bookCoinsEarned: function () {
      return this.bookCoinsEarned.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    backgroundColor: function () {
      return bookColors[bookNames.indexOf(this.bookName)]
    },
    chart: function () {
      Meteor.subscribe("books_db", function onComplete() {
        var bookProgress = Books.find({owner: Session.get('profileID'), bookName:{$ne: 'demo'}, bookCoinsEarned:{ $gt: 0 }}).fetch()
        var graphArray = new Array()

        $.each(bookProgress, function( index, value ) {
          if(value.bookCoinsEarned){
            graphArray.push({
              value: value.bookCoinsEarned,
              color: bookColors[bookNames.indexOf(value.bookName)]
            })
          }
        
        });

        if(!ChartObject){
          var interestContext = $("#canvas").get(0).getContext("2d");
          var ChartObject = new Chart(interestContext);

          ChartObject.Doughnut(graphArray);
        }
      })
    }
  });

  Template.outer_tmpl.onRendered(function () {
    preload([
          '/images/loader.gif',
          '/images/loader_white.gif',
          '/images/small-loader.gif'
      ]);

      Meteor.subscribe("userdata", function() {

        if(Meteor.user() && !$('.uv-icon').length && !isMyScriptLoaded('http://widget.uservoice.com/IDaui0jyJUpmVFn7PYrNg.js')){
          
          // Include the UserVoice JavaScript SDK (only needed once on a page)
          UserVoice=window.UserVoice||[];(function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/IDaui0jyJUpmVFn7PYrNg.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})();

          //
          // UserVoice Javascript SDK developer documentation:
          // https://www.uservoice.com/o/javascript-sdk
          //

          // Set colors
          UserVoice.push(['set', {
            accent_color: '#e23a39',
            trigger_color: 'white',
            trigger_background_color: 'rgba(42, 42, 42, 0.6)'
          }]);
          var name
          
          if(Meteor.user().profile.name){
            name = Meteor.user().profile.name
          }else{
            name = Meteor.user().username
          }
          
          // Identify the user and pass traits
          // To enable, replace sample data with actual user traits and uncomment the line
          UserVoice.push(['identify', {
            email:      Meteor.user().profile.email, // User’s email address
            name:       name, // User’s real name
            created_at: Meteor.user().createdAt, // Unix timestamp for the date the user signed up
            id:         Meteor.userId() // Optional: Unique id of the user (if set, this should not change)
            //type:       'Owner', // Optional: segment your users by type
            //account: {
            //  id:           123, // Optional: associate multiple users with a single account
            //  name:         'Acme, Co.', // Account name
            //  created_at:   1364406966, // Unix timestamp for the date the account was created
            //  monthly_rate: 9.99, // Decimal; monthly rate of the account
            //  ltv:          1495.00, // Decimal; lifetime value of the account
            //  plan:         'Enhanced' // Plan name for the account
            //}
          }]);

          // Add default trigger to the bottom-right corner of the window:
          UserVoice.push(['addTrigger', { mode: 'contact', trigger_position: 'bottom-right' }]);

          // Or, use your own custom trigger:
          //UserVoice.push(['addTrigger', '#id', { mode: 'contact' }]);

          // Autoprompt for Satisfaction and SmartVote (only displayed under certain conditions)
          UserVoice.push(['autoprompt', {}]);
        }else{

        }
      })
  });

  Template.sign_up_overlay_tmpl.helpers({
    errorMsg: function () {
      return Session.get('errorMsg')
    }
  });

  Template.sign_in_overlay_tmpl.helpers({
    errorMsg: function () {
      return Session.get('errorMsg')
    }
  });

  Template.sign_in_overlay_tmpl.helpers({
    errorMsg: function () {
      return Session.get('errorMsg')
    },
    resetPassword: function () {
      return Session.get('resetPassword');
    },
    loading: function () {
      return Session.get('loading');
    },
    emailSent: function () {
      return Session.get('emailSent');
    }
  });

  Template.admin_content_tmpl.helpers({
    user: function () {
      return Meteor.users.find({}, {sort: {"profile.progressPercent": -1}}); 
    }
  });

  Template.admin_tmpl.onRendered(function () {
    if (!this.rendered){
      Meteor.subscribe( "progress_db", function() {progressGraph()})
      $(".admin-container").empty()
      Blaze.render(Template.admin_content_tmpl, $('.admin-container')[0])
      //UI.insert(UI.render(Template.admin_content_tmpl), document.getElementsByClassName('admin-container')[0])
      
      this.rendered = true;
    }
  });

  Template.admin_content_tmpl.helpers({
    userCount: function () {
      return Meteor.users.find().count()
    }
  });

  Template.admin_tmpl.helpers({
    userCount: function () {
      return Meteor.users.find().count()
    },
    emailCount: function () {
      return EmailList.find().count()
    }
  });

  Template.admin_content_tmpl.helpers({
    dayProgress: function () {
      return Session.get('dayProgress')
    },
    monthName: function () {
      return Session.get('currentMonth')
    }
  });

  Template.signup_email_tmpl.helpers({
    signupEmail: function () {
      return EmailList.find()
    }
  });

  Template.user_email_tmpl.helpers({
    userEmail: function () {
      return Meteor.users.find()
    }
  });

  Template.search_results_tmpl.helpers({
    following: function () {
      var followingUser = Following.findOne({owner: Meteor.userId(), following:this._id})
      if(followingUser){
        return true
      }
    },
    user: function () {
      return Session.get('userSearchResult')
    },
    query: function () {
      return Session.get('userSearchQuery')
    },
    queryCount: function () {
      return Session.get('userSearchCount')
    }
  });

  Template.credit_form_tmpl.helpers({
    loggedIn: function () {
      return Session.get('loggedIn')
    },
    donateAmount: function () {
      return Session.get('donationAmountDec')
    }
  });

  Template.billing_tmpl.helpers({
    creditCardInfo: function () {
      if(Donations.findOne({owner: Meteor.userId()})){
        Session.set('custId', Donations.findOne({owner: Meteor.userId()}).custId) 
        Meteor.call('pullCustomer', function (error, result){
          Session.set('custInfo',{cardNum:result.cards.data[0].last4, cardExpMonth: result.cards.data[0].exp_month, cardExpYear: result.cards.data[0].exp_year, cardType: result.cards.data[0].type})
        })
        return Session.get('custInfo')
      }
    },
    custCharges: function () {
      listAllCharges()
      return Session.get('listCharges')
    },
    totalDonated: function () {
      if(Session.get('totalDonated') == ""){
        //console.log('if')
        var total = Session.get('totalDonated')
        return String(total).replace(/([0-9][0-9])$/, ".$1")
      }else{
        listAllCharges()
        var total = Session.get('totalDonated')
        if(Session.get('totalDonated')){
          return String(total).replace(/([0-9][0-9])$/, ".$1")
        }
        
      }
    }
  });

  Template.invoice_tmpl.helpers({
    invoice: function () {
      if(Session.get('invoice') && Session.get('invoice') != 'invalid'){
        if(Session.get('invoice').id == Session.get('chargeId')){
          return Session.get('invoice')
        }else{
          Session.set('invoice','')
        }
      }
      
      if(Session.get('chargeId')){
        Meteor.call('displayCharge', Session.get('chargeId'), function(error, result){
          Session.set('invoice', result)
        })
        return Session.get('invoice')
      }
    },
    invalid: function () {
      if(Session.get('invoice') == 'invalid'){
        return true
      }
    },
    amountDec: function () {
      return String(this.amount).replace(/([0-9][0-9])$/, ".$1")
    },
    date: function () {
      var date = new Date(this.created * 1000);
      return monthNames[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()
    }
  });

  Template.donate_thanks_tmpl.helpers({
    id: function () {
      if(Session.get('chargeId')){
        return Session.get('chargeId')
      }
    }
  });

  Template.credit_form_tmpl.helpers({
    creditCardInfo: function () {
      Session.set('custId', Donations.findOne({owner: Meteor.userId()}).custId) 
      Meteor.call('pullCustomer', function (error, result){
        Session.set('custInfo',{cardNum:result.cards.data[0].last4, cardExpMonth: result.cards.data[0].exp_month, cardExpYear: result.cards.data[0].exp_year, cardType: result.cards.data[0].type})
      })
      return Session.get('custInfo')
    },
    custId: function () {
      if(Meteor.userId()){
        if(Donations.findOne({owner: Meteor.userId()})){
          return true
        }
      }
    }
  });

  Template.activity_page_tmpl.helpers({
    pageName: function () {
      var urlName = Backbone.history.fragment.replace('/', '')
      return urlName
    }
  });

  Template.activity_tmpl.helpers({
    activity: function () {
      return Activity.find({owner: Meteor.userId()},{sort: {date: -1}, limit:10})
    },
    followingUser: function () {
      Meteor.subscribe("activitydata", this.activityFollowing)
      return Meteor.users.findOne({_id:this.activityFollowing})
    },
    likes: function () {
      return this.like.length
    },
    demo: function () {
      if(this.bookName == 'demo'){
        return true
      }
    },
    likeNames: function () {
      if(this.like.length){
        var namesString
        var self = this
        Meteor.subscribe("likedata", this.like, function(){
          for(var i=0;i<=self.like.length-1; i++){
            if(i == 0){
              Session.set('likeNameString', Meteor.users.findOne({_id:self.like[i]}).username)
            }else{
              Session.set('likeNameString', Session.get('likeNameString')+', '+Meteor.users.findOne({_id:self.like[i]}).username) 
            }
          }
        })
        return Session.get('likeNameString')
      }
    },
    chapterGrammer: function () {
      if(this.completedChapter.length > 1){
        return 'chapters'
      }else{
        return 'chapter'
      }
    },
    bookNameTrim: function () {
      if(this.bookName){
        var bookName = this.bookName
      }else{
        var bookName = this.bookComplete
      }
      var trimmed = bookName.replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
      return trimmed
    },
    badges: function () {
      var badges = Books.find({owner: Meteor.userId(), bookName:{$ne: 'demo'}, totalComplete:true}, {fields: {'bookName': 1, 'completeDate': 1}, sort: {'completeDate': -1}}).fetch()
      return badges
    },
    bibleFinished: function () {
      if(Meteor.user().profile.finished){
        return true
      }
    },
    finishedDate: function () {
      var d = new Date(Meteor.user().profile.finishedDate);
      var curr_date = d.getDate();
      var curr_month = d.getMonth();
      var curr_year = d.getFullYear();
      
      return curr_date + " " + monthNames[curr_month] + " " + curr_year
    },
    completeDate: function () {
      if(this.completeDate){
        var d = new Date(this.completeDate);
      }else{
        var d = new Date();
      }
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();
        
        return curr_date + " " + monthNames[curr_month] + " " + curr_year 
    },
    progressData: function () {
      var bookProgress = Books.find({owner: Meteor.userId(), bookName:{$ne: 'demo'}, bookCoinsEarned:{ $gt: 0 }},{sort: {bookCoinsEarned: -1}}).fetch()
      return bookProgress
    },
    bookCoinsEarned: function () {
      return this.bookCoinsEarned.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    backgroundColor: function () {
      return bookColors[bookNames.indexOf(this.bookName)]
    },
    progressPercent: function () {
      var progressPercent = Meteor.user().profile.progressPercent
      return progressPercent
    },
    date: function () {
      return $.timeago(this.date)
    },
    chart: function () {
      Meteor.subscribe("books_db", function onComplete() {
        var bookProgress = Books.find({owner: Meteor.userId(), bookName:{$ne: 'demo'}, bookCoinsEarned:{ $gt: 0 }}).fetch()
        var graphArray = new Array()

        $.each(bookProgress, function( index, value ) {
          if(value.bookCoinsEarned){
            graphArray.push({
              value: value.bookCoinsEarned,
              color: bookColors[bookNames.indexOf(value.bookName)]
            })
          }
        
        });

        if(!ChartObject){
          var interestContext = $("#canvas").get(0).getContext("2d");
          var ChartObject = new Chart(interestContext);

          ChartObject.Doughnut(graphArray);
        }
      })
    }
  });

  Template.activity_tmpl.onRendered(function () {
    activityResize()
    $( window ).resize(function() {
      activityResize()
    });
    percentChart()
  });

  Template.chest_overlay_tmpl.helpers({
    bookName: function () {
      return Session.get('chestBookName')
    },
    queryLoaded: function () {
      return Session.get('userSearchLoaded')
    }
  });

  Template.chest_overlay_tmpl.onRendered(function () {
    if(!$('.bx-wrapper').length){
      slidey = $('.all-choices-mobile ul').bxSlider({
        controls: false,
        infiniteLoop: false,
        touchEnabled: true,
        oneToOneTouch: true
      });
      $('.choice').each(function(){
        if($(this).hasClass('active')){
          slidey.goToSlide($(this).attr('data-slide-num'));
        }
      })
    }
  });

  Template.email_ver_alert_tmpl.events({
    'click .close' : function(event){
      $('.email-verified').remove()
    }
  })

  Template.email_sent_alert_tmpl.events({
    'click .close' : function(event){
      $('.email-verified').remove()
    }
  })

  Template.donate_tmpl.events({
    'click .donate-now' : function(event){
      mixpanel.track('Donation page',{'Step':'Proceed'})
      var donationAmount = $('#donation-amount').val()
      var loggedIn = (Meteor.userId()) ? true : false;
      Session.set('loggedIn', loggedIn)
      Session.set('donationAmount', donationAmount.replace(/\./g, ''))
      Session.set('donationAmountDec', donationAmount)
      if(Donations.findOne({owner: Meteor.userId()})){
        $('.donate-now').hide()
        $('.form-load').show()
      }
      $("#donation-container").empty()
      Blaze.render(Template.credit_form_tmpl, $('#donation-container')[0])
      //UI.insert(UI.render(Template.credit_form_tmpl), document.getElementById('donation-container'))

      return false;
    },
    'click .donate-login' : function(event){
      mixpanel.track('Donation page',{'Step':'Login'})
      Session.set('errorMsg', '')
      loadInOverlay('overlay-content')
      Blaze.render(Template.sign_in_overlay_tmpl, $('.overlay-content')[0])
      //.insert(UI.render(Template.sign_in_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
      $('.overlay-content').addClass('no-route')
      return false;
    },
    'click .donate-anon' : function(event){
      mixpanel.track('Donation page',{'Step':'Donate anonymously'})
      Session.set('loggedIn', true)
      return false;
    },
    'click .change' : function(event){
      mixpanel.track('Donation page',{'Step':'Change amount'})
      $("#donation-container").empty()
      Blaze.render(Template.donate_form_tmpl, $('#donation-container')[0])
      //UI.insert(UI.render(Template.donate_form_tmpl), document.getElementById('donation-container'))
      $("#donation-container").find('#donation-amount').val(Session.get('donationAmountDec'))
      return false;
    },
    'click .change-card': function(){
      mixpanel.track('Donation page',{'Step':'Change card'})
      loadInOverlay('overlay-content')
      Blaze.render(Template.card_change_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.card_change_tmpl), document.getElementsByClassName('overlay-content')[0])
      return false
    },
    'click .submit-payment.existing' : function(event){
      $('.submit-payment').hide();
      $('.form-load').show();
      Meteor.call('donateChargeExisting', Session.get('donationAmount'), function(err, data){
        //console.log(data)
        if(data[0] == 'err'){
         //console.log(data.message) 
         mixpanel.track('Donation page',{'Step':'Error: '+data[1].message})
         $('#card-info-container').prepend('<div class="error-message">'+data[1].message+'</div>')
         $('.submit-payment').show();
         $('.form-load').hide();
        }else{
          mixpanel.track('Donation page',{'Step':'Donate: $'+Session.get('donationAmount')})
          Session.set('chargeId', data[1].id)
          $("#donation-container").empty()
          Blaze.render(Template.donate_thanks_tmpl, $('#donation-container')[0])
          //UI.insert(UI.render(Template.donate_thanks_tmpl), document.getElementById('donation-container'))
        }
        
      })
      return false;
    },
    'click .submit-payment.new' : function(event){
      var $form = $('#payment-form');
      Session.set('tokenForm', '#payment-form')
      // Disable the submit button to prevent repeated clicks

      
      $form.find('.submit-payment').hide();
      $form.find('.form-load').show();

      var name = "Anonymous"
      if(Meteor.user()){
        name = $('.full-name').val()
      }

      Stripe.card.createToken({
        name: name,
        number: $('.card-number').val(),
        cvc: $('.card-cvc').val(),
        exp_month: $('.card-month').val(),
        exp_year: $('.card-year').val()
      }, stripeResponseHandler);
      // Prevent the form from submitting with the default action
      return false;
    },
    'click #form-complete': function(){
      var token = $('#payment-form #tokenId').val();
      Meteor.call('donateCharge', token, Session.get('donationAmount'), function(err, data){
        //console.log(data)
        if(data[0] == 'err'){
         //console.log(data.message) 
         $('#card-info-container').prepend('<div class="error-message">'+data[1].message+'</div>')
         $('.submit-payment').show();
         $('.form-load').hide();
        }else if(data[0] == 'charge'){
          mixpanel.track('Donation page',{'Step':'Error: '+data[1].message})
          Session.set('chargeId', data[1].id)
          $("#donation-container").empty()
          Blaze.render(Template.donate_thanks_tmpl, $('#donation-container')[0])
          //UI.insert(UI.render(Template.donate_thanks_tmpl), document.getElementById('donation-container'))

        }else{
          mixpanel.track('Donation page',{'Step':'Donate: $'+Session.get('donationAmount')})
          $("#donation-container").empty()
          Blaze.render(Template.donate_thanks_tmpl, $('#donation-container')[0])
          //UI.insert(UI.render(Template.donate_thanks_tmpl), document.getElementById('donation-container'))
        }
      })
    }
  })

  Template.landing_tmpl.events({
    'click .sign-up-landing' : function(e){
      if($(e.target).hasClass('top-sign')){
        Session.set('sign-up-location', "Top landing")
        mixpanel.track('Sign up', {'Location':'Top landing'})
      }else{
        Session.set('sign-up-location', "Bottom landing")
        mixpanel.track('Sign up', {'Location':'Bottom landing'})
      }
      Session.set('errorMsg', '')
      loadInOverlay('overlay-content')
      Blaze.render(Template.sign_up_overlay_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.sign_up_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
      //$('.overlay-content').append(UI.render(Template.sign_up_overlay_tmpl))
      return false;
    }
  })

  Template.landing_email_tmpl.events({
    'click .email-send' : function(){
      $('.email-input').removeClass('error')
      $('.email-notification').removeClass('email-error').removeClass('email-success')
      $('.email-notification').html('<img src="/images/loader.gif" alt="Loading..." />').show()
      var email = validateEmail($('.email-input').val())
      if($('.email-input').val()){
        if(email){
          var html = Template.email_list_tmpl({
            message: 'welcome'
          })
          Meteor.call('emailWaitingList', $('.email-input').val(), html, function (error, result) { 
            if(result == false){
              $('.email-input').addClass('error')
              $('.email-notification').html("The email entered already exists").addClass('email-error')
            }else{
              $('.email-input').val('')
              $('.email-notification').html("Thanks! We\'ll let you know as soon as we\'re up and running").addClass('email-success')
              $('.email-notification').delay(4500).fadeOut(300)
            }
            return false
          })
          
        }else{
          $('.email-input').addClass('error')
          $('.email-notification').html("The email entered is incorrect").addClass('email-error')
        }
      }else{
        $('.email-input').addClass('error')
        $('.email-notification').html("Please enter your email address").addClass('email-error')
      }
      
      
      return false;
    }
    
  })

  Template.landing_outer_tmpl.events({
    'click .sign-in-btn' : function(){
      Session.set('errorMsg', '')
      loadInOverlay('overlay-content')
      Blaze.render(Template.sign_in_overlay_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.sign_in_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
      $('.overlay-content').addClass('sign-up-in-overlay')
      return false;
    },
    'click .sign-up-btn' : function(){
      mixpanel.track('Sign up', {'Location':'Top nav'})
      Session.set('sign-up-location', "Top nav")
      Session.set('errorMsg', '') 
      loadInOverlay('overlay-content')
      Blaze.render(Template.sign_up_overlay_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.sign_up_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
      $('.overlay-content').addClass('sign-up-in-overlay')
      return false;
    }
  })

  Template.outer_tmpl.events({
    'click .sign-in-btn' : function(){
      Session.set('errorMsg', '')
      loadInOverlay('overlay-content')
      Blaze.render(Template.sign_in_overlay_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.sign_in_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
      $('.overlay-content').addClass('sign-up-in-overlay')
      return false;
    },
    'click .sign-up-btn' : function(){
      mixpanel.track('Sign up', {'Location':'Top nav'})
      Session.set('sign-up-location', "Top nav")
      Session.set('errorMsg', '')
      loadInOverlay('overlay-content')
      Blaze.render(Template.sign_up_overlay_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.sign_up_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
      $('.overlay-content').addClass('sign-up-in-overlay')
      return false;
    },
    'click .my-profile' : function(){
      window.location.href = '/profile';
      return false
    },
    'click .my-settings' : function(){
      window.location.href = '/account';
      return false
    },
    'click .my-billing' : function(){
      window.location.href = '/billing';
      return false
    },
    'click .profile-contain' : function(e){
      $('ul.store-container li ul.item-store-drop').hide()
      $('.profile-contain ul').show()
      e.stopPropagation();
      return false
    },
    'click #item-store' : function(e){
      if(!$('.item-store-drop').is(':visible')){
        mixpanel.track('Open shop')
      }
      Meteor.call('removeNotifications')
      
      $('.shop-contain').empty()
      Blaze.render(Template.item_dropdown_tmpl, $('.shop-contain')[0])
      //UI.insert(UI.render(Template.item_dropdown_tmpl), document.getElementsByClassName('shop-contain')[0])
      return false
    },
    'click .store-container' : function(e){
      $('.profile-contain ul').hide()
      e.stopPropagation();
      return false
    },
    'click .logo' : function(){
      //Router.home();
      window.location.href = '/';
      return false
    },
    'click .top-search-icon': function(e){
      var searchVal = $('#top-search-input').val()
      search(searchVal)
      return false
    },
    'keypress #top-search-input': function(e){
      var searchVal = $('#top-search-input').val()
      if (e.keyCode == 13) {
        search(searchVal)
        return false
      }
    },
    'click .mobile-menu.open': function(e){
      sideMenuClose()
      toggleMenus(e, 'main-menu')
      return false
    },
    'click .mobile-menu.closed': function(e){
      sideMenuOpen()
      toggleMenus(e, 'main-menu')
      return false
    },
    'click #item-store.open': function(e){
      sideItemMenuClose()
      toggleMenus(e, 'item-menu')
      return false
    },
    'click #item-store.closed': function(e){
      sideItemMenuOpen()
      toggleMenus(e, 'item-menu')
      return false
    },
    'click .site-cover': function(e){
      sideMenuClose()
      sideItemMenuClose()
      toggleMenus(e, 'both')
      return false
    }
  })

  Template.total_streak_tmpl.events({
    'mouseover .streak-points': function(e){
      var target = $(e.currentTarget)
      popupBubble(target, target.attr('data-popup'), true);
    },
    'mouseout .streak-points': function(e){
      $('.popup-bubble').remove()
    }
  })

  Template.total_points_tmpl.events({
    'mouseover .total-points': function(e){
      var target = $(e.currentTarget)
      popupBubble(target, target.attr('data-popup'), true);
    },
    'mouseout .total-points': function(e){
      $('.popup-bubble').remove()
    }
  })

  Template.total_chapters_complete_tmpl.events({
    'mouseover .total-points': function(e){
      var target = $(e.currentTarget)
      popupBubble(target, target.attr('data-popup'), true);
    },
    'mouseout .total-points': function(e){
      $('.popup-bubble').remove()
    }
  })

  Template.drop_menu_tmpl.events({
    'click .sign-out-btn' : function(){
      $('.left-menu .sign-out-btn').css({'background-color':'#444444'})
      $('.sign-out-btn .sign-out').addClass('signing-out')
      loadingPage()
      Meteor.logout(function(err){
        window.location.href = '/';
      })
      
      return false;
    }
  })

  Template.item_dropdown_tmpl.events({
    'click .item-store-drop .item.purchased' : function(e){
      return false
    },
    'click .item-store-drop .item.not-purchased' : function(e){
      if($(e.currentTarget).hasClass('selected')){
        confirmSlideup()
      }else{
        confirmSlideup()
        var confirmContainer = $(e.currentTarget).parent().find('.confirm-container')
        $(e.currentTarget).addClass('selected')
        confirmContainer.slideDown("fast")
      }
      return false;
    },
    'click .item-store-drop .confirm.not-enough' : function(e){
      return false
    },
    'click .item-store-drop .confirm.green-gradient' : function(e){
      var itemConfirm = $(e.currentTarget).attr('data-confirm-item')
      var points = Points.findOne({owner: Meteor.userId()})
      if(itemConfirm == 'confirm-coins'){
        Meteor.call('confirmCoins', function(){
          confirmSlideup(e)
          mixpanel.track('Unlock shop item', {'Item':'500 coins'})
        })
      }else if(itemConfirm == 'confirm-revive'){
        Meteor.call('confirmRevive', function(){
          confirmSlideup(e)
          mixpanel.track('Unlock shop item', {'Item':'5x Question revive'})
        })
      }else if(itemConfirm == 'confirm-life-upgrade'){
        Meteor.call('confirmLifeUpgrade', function(){
          confirmSlideup()
          mixpanel.track('Unlock shop item', {'Item':'1 Extra life'})
        })
      }else if(itemConfirm == 'confirm-show-questions'){
        Meteor.call('confirmShowQuestions', function(){
          confirmSlideup()
          mixpanel.track('Unlock shop item', {'Item':'Show all questions'})
        })
      }else if(itemConfirm == 'confirm-unlimited-audio'){
        Meteor.call('confirmUnlimited', function(){
          confirmSlideup()
          mixpanel.track('Unlock shop item', {'Item':'No audio coin cap'})
        })
      }
      return false;
    },
    'click .item-store-drop .show-all' : function(e){
      $('ul.item-store-drop li.hide').show()
      $('.item-store-drop .show-all').html('Show less').addClass('selected')
      return false;
    },
    'click .item-store-drop .show-all.selected' : function(e){
      $('ul.item-store-drop li.hide').hide()
      $('.item-store-drop .show-all').html('Show all').removeClass('selected')
      return false;
    }
  })

  Template.account_following_tmpl.events({
    'click .user-container.plus.following': function(e){
      loadInOverlay('overlay-content')
      Blaze.render(Template.account_following_plus_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.account_following_plus_tmpl), document.getElementsByClassName('overlay-content')[0])
      $('.overlay-content').addClass('follow-overlay')
      return false
    }
  })

  Template.account_follower_tmpl.events({
    'click .user-container.plus.followers': function(e){
      loadInOverlay('overlay-content')
      Blaze.render(Template.account_follower_plus_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.account_follower_plus_tmpl), document.getElementsByClassName('overlay-content')[0])
      $('.overlay-content').addClass('follow-overlay')
      return false
    }
  })

  Template.account_info_tmpl.events({
    'click .bible-version': function(e){
      $('.bible-version').removeClass('selected')
      $(e.target).addClass('selected')
      return false
    },
    'click .save-profile': function(){
      var profileName = $('#profile-name').val()
      var profileEmail = $('#profile-email').val()
      var profileUsername = $('#profile-username').val()
      var profileBio = $('#profile-bio').val()
      var oldPassword = $('#old-password').val()
      var newPassword = $('#new-password').val()
      var retypePassword = $('#retype-password').val()
      var profileBibleVersion = 'jsonBooks'
      // $('.bible-version').each(function(){
      //   if($(this).hasClass('selected')){
      //     profileBibleVersion = $(this).attr('data-version')
      //   }
      // })

      $('.password').removeClass('error')
      $('.error-message').hide()
      if(oldPassword || newPassword || retypePassword){
        if(oldPassword && newPassword && retypePassword){
          if(newPassword == retypePassword){
            Accounts.changePassword(oldPassword, newPassword, function(error){
              if(error){
                $('#old-password').addClass('error')
                $('.error-message').show().html("That's not your old password")
              }
            })
          }else{
            $('#retype-password').addClass('error')
            $('.error-message').show().html("The new passwords don't match")
          }
        }else{
          $('.password').each(function(){
            var empty = ($(this).val()) ? false : true
            if(empty){
              $(this).addClass('error')
              $('.error-message').show().html('Field is empty')
            }
          })
        }
      }
      if(profileBibleVersion != Meteor.user().profile.version){
        Session.set("jsonDataChapter","")
      }
      Meteor.call('updateProfile', profileName, profileEmail, profileUsername, profileBio, profileBibleVersion, function(error, result){
        var savedSpan = $('#account-container .buttons .saved')
        if(result == 'saved'){
          savedSpan.html('Saved!').css('color','#2ABB26').show().delay(2000).fadeOut()
        }else if(result == 'emailError'){
          savedSpan.html('Invalid email').css('color','#D40000').show().delay(2000).fadeOut()
        }else if(result == 'usernameError'){
          savedSpan.html('Username cannot contain spaces').css('color','#D40000').show().delay(2000).fadeOut()
        }
        
      })
      return false
    },
    'mouseover .email-container span': function(e){
      var content = $(e.target).html()
      popupBubble($(e.target), content)
    },
    'mouseout .email-container span': function(e){
      $('.popup-bubble').remove()
    },
    'click .email-container .not-verified': function(e){
      Session.set('verEmailSent', true)
      Meteor.call('sendVerification', Meteor.userId())
    }

  })

  Template.account_left_tmpl.events({
    'click .choose-avatar': function(){
      $('#attachment').click()
      return false
    },
    'change #attachment': function(e){
        var input = e.target

        if (!input.files[0]) {
            //console.log("Choose an image to store to S3");
        } else {
          var type = input.files[0].type
          //console.log(input.files[0])
          if(type.substring(0, type.indexOf('/')) != 'image'){
              $('#left-container .error').html('Must be an image file')
              $('#left-container .error').show().delay(5000).fadeOut()
          }else if(input.files[0].size > 500000){
              $('#left-container .error').html('File size too big')
              $('#left-container .error').show().delay(5000).fadeOut()
          }else{
            $('#left-container .progress').css('display','inline-block')
            filepicker.store(input.files[0], function(InkBlob){
                filepicker.convert(InkBlob, {width: 138, height: 138, fit: 'crop'},{location: 'S3'},
                    function(new_InkBlob){
                        var imagePath = JSON.stringify(new_InkBlob.key).replace(/\"/g,"")
                        Meteor.call('updateUserAvatar', imagePath)
                    }
                );
                
              }, function(FPError) {
                console.log(FPError.toString());
              }, function(progress) {
                $('#left-container .progress span.complete').animate({width: progress+"%"})
                if(progress == 100){
                  $('#left-container .progress').delay(500).fadeOut(1000, function(){
                    $('#left-container .progress span.complete').css('width',"0%")
                  })
                }
              }
           );
          }
        }
    }
  })

  Template.account_right_tmpl.events({
    'click #account-info-link': function(){
      $('.account-nav').removeClass('selected')
      $('#account-info-link').addClass('selected')
      $('#lower-right').empty()
      Blaze.render(Template.account_info_tmpl, $('#lower-right')[0])
      //UI.insert(UI.render(Template.account_info_tmpl), document.getElementById('lower-right'))
      Router.navigate("/account");
      return false
    },
    'click #billing-info-link': function(){
      $('.account-nav').removeClass('selected')
      $('#billing-info-link').addClass('selected')
      $('#lower-right').empty()
      Blaze.render(Template.billing_tmpl, $('#lower-right')[0])
      //UI.insert(UI.render(Template.billing_tmpl), document.getElementById('lower-right'))
      Router.navigate("/billing");
      return false
    },

    'click #activity-info-link': function(){
      $('.account-nav').removeClass('selected')
      $('#activity-info-link').addClass('selected')
      $('#lower-right').empty()
      Blaze.render(Template.activity_tmpl, $('#lower-right')[0])
      //UI.insert(UI.render(Template.activity_tmpl), document.getElementById('lower-right'))
      Router.navigate("/profile");
      return false
    }
  })

  Template.billing_tmpl.events({
    'click .change-card': function(){
      loadInOverlay('overlay-content')
      Blaze.render(Template.card_change_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.card_change_tmpl), document.getElementsByClassName('overlay-content')[0])
      return false
    }
  })

  Template.invoice_tmpl.events({
    'click .close': function(e){
      Blaze.render(Template.billing_tmpl, $('#lower-right')[0])
      //UI.insert(UI.render(Template.billing_tmpl), document.getElementById('lower-right'))
      Router.navigate("/billing");
      return false
    },
    'click .print': function(e){
      $('.invoice-content').printArea(); 
      return false
    }
  })

  Template.activity_tmpl.events({
    'click .like': function(e){
      $('.popup-bubble').remove()
      Meteor.call('likeActivity', this._id)
      return false
    },
    'mouseover .like': function(e){
      $('.popup-bubble').remove()
      var names = $(e.currentTarget).find('b').html()
      if(names) popupBubble($(e.currentTarget), names);
      return false
    },
    'mouseout .like': function(e){
      $('.popup-bubble').remove()
    }
  })

  Template.card_change_tmpl.events({
    'click .save-card': function(){
      $('.save-card').hide()
      $('#card-change-form .form-load').show()
      var $form = $('#card-change-form');
      Session.set('tokenForm', '#card-change-form')
      Stripe.card.createToken($form, stripeResponseHandler);
      return false
    },
    'click #form-complete': function(){
      var token = $('#card-change-form').find('#tokenId').val();
      if(token){
        Meteor.call('createCard', token, function(err, cardData){
          if(err){
           console.log('card: '+err) 
          }
          Meteor.call('updateDefaultCard', cardData.id, function(err, custData){
            if(err){
             console.log('customer: ' +err) 
            }
            $('.black-overlay .close').click()
          })
        })
      }
      return false
    }
  })

  Template.tour_tmpl.events({
    'click #book-0-box': function(){
      mixpanel.track('Tour', {'Step':1}, function(){
        Session.set('audioFile', 'https://s3.amazonaws.com/versesweb/audio/demo.mp3')
        Session.set("verseAudioBegin", '')
        $('.overlay-content').empty()
        Blaze.render(Template.tour_step2_tmpl, $('.overlay-content')[0])
        //UI.insert(UI.render(Template.tour_step2_tmpl), document.getElementsByClassName('overlay-content')[0])
        audioInitiate('demo')
      });
      return false
    },
    'click .skip-tour':function(){
      mixpanel.track('Skipped tour', {'Step':1}, function(){
        Meteor.call('updateNewUser')
        $('.black-overlay, .tour-container').remove()
        $('body').removeClass('noScroll')
      });
    }
  })

  Template.tour_step2_tmpl.events({
    'click .skip-tour':function(){
      mixpanel.track('Skipped tour', {'Step':2}, function(){
        Meteor.call('updateNewUser')
        $('.black-overlay, .tour-container').remove()
        $('body').removeClass('noScroll')
      });
    },
    'click .continue':function(){
      mixpanel.track('Tour', {'Step':2}, function(){
        $('.overlay-content').empty()
        Blaze.render(Template.tour_step3_tmpl, $('.overlay-content')[0])
        //UI.insert(UI.render(Template.tour_step3_tmpl), document.getElementsByClassName('overlay-content')[0])
      });
      return false
    },
    'click .jp-play': function(){
      var t=setTimeout(function(){
        var totalTime = $('.jp-duration').html();
        addAudioCoins(3, totalTime, 'demo', 1)
      },2000)
    }
  })

  Template.tour_step3_tmpl.events({
    'click .skip-tour':function(){
      mixpanel.track('Skipped tour', {'Step':3}, function(){
        Meteor.call('updateNewUser')
        $('.black-overlay, .tour-container').remove()
        $('body').removeClass('noScroll')
      });
    },
    'click .answer' : function(e){
      answerQuestion(e, 'demo')
      return false;
    },
    'click .jp-play': function(){
      var t=setTimeout(function(){
        var totalTime = $('.jp-duration').html();
        addAudioCoins(3, totalTime, 'demo', 1)
      },2000)
    },
    'click .complete-tour' : function(e){
      mixpanel.track('Tour', {'Step':3}, function(){
        $('.overlay-content').empty()
        Blaze.render(Template.tour_step4_tmpl, $('.overlay-content')[0])
        //UI.insert(UI.render(Template.tour_step4_tmpl), document.getElementsByClassName('overlay-content')[0])
      });
      return false;
    },
  })

  Template.tour_step4_tmpl.events({
    'click .close-tour':function(){
      mixpanel.track('Tour', {'Complete': 'Yes'}, function(){
        Meteor.call('updateNewUser')
        $('.black-overlay, .tour-container').remove()
        $('body').removeClass('noScroll')
      });
    }
  })

  Template.sign_in_overlay_tmpl.events({
    'submit #sign-in-form' : function(e, t){
      signIn(e,t,!$('.overlay-content').hasClass('no-route'))
      clearSessions()
      return false
    },
    'click .fb-login' : function(e, t){
      mixpanel.track('FB sign in')
      Meteor.loginWithFacebook({ requestPermissions: ['email']},
      function (error) {
          if (error) {
              mixpanel.track('FB sign in error', {'Message':error.message})
              Session.set('errorMsg', error.message)
          }else{
            mixpanel.identify(Meteor.userId());
            mixpanel.people.set({
                "$name": Meteor.user().username, 
                "$email": Meteor.user().emails[0].address,    
                "$created": new Date(),
                "$last_login": new Date(), 
                "$username": Meteor.user().username,        
                "Points": 0,
                "Stars": 0                
            },function(){
                mixpanel.track('FB sign in', {'Success':'yes'}, function(){
                $('.black-overlay .close').click()
                window.location.href = '/';
              })
            });
          }
      });
      return false
    },
    'click .create-account' : function(){
      Session.set('errorMsg', '')
      $('#sign-in-container').fadeOut(250, function(){
        $('#sign-in-container').remove();
        Blaze.render(Template.sign_up_overlay_tmpl, $('.overlay-content')[0])
        //UI.insert(UI.render(Template.sign_up_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
      })
      return false
    },
    'click .forgot-password' : function(){
      Session.set('errorMsg', '')
      Session.set('emailSent', false)
      $('#sign-in-container').fadeOut(250, function(){
        $('#sign-in-container').remove();
        Blaze.render(Template.forgot_password_overlay_tmpl, $('.overlay-content')[0])
        //UI.insert(UI.render(Template.forgot_password_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
      })
      return false
    }
  })

  Template.sign_up_overlay_tmpl.events({
    'click .fb-login' : function(e, t){
      mixpanel.track('FB sign up')
      Meteor.loginWithFacebook({ requestPermissions: ['email']},
      function (error) {
          if (error) {
              mixpanel.track('FB sign up error', {'Message':error.message})
              Session.set('errorMsg', error.message)
          }else{
            mixpanel.identify(Meteor.userId());
            mixpanel.people.set({
                "$name": Meteor.user().username, 
                "$email": Meteor.user().emails[0].address,    
                "$created": new Date(),
                "$last_login": new Date(), 
                "$username": Meteor.user().username,        
                "Points": 0,
                "Stars": 0                
            },function(){
                mixpanel.track('FB sign up', {'Success':'yes'}, function(){
                $('.black-overlay .close').click()
                window.location.href = '/';
              })
              
            });
            
          }
      });
      return false
    },
    'submit #sign-up-form' : function(e, t){
      var emailRaw = t.find('#email').value
      var password = t.find('#password').value
      var username = t.find('#username').value
      var emailTrimmed = trimInput(emailRaw);
      //console.log(profileCreated)
      
      //console.log(emailTrimmed)
      var email = validateEmail(emailTrimmed)
      var isValidPassword = function(val) {
         return val.length >= 6 ? true : false; 
      }

      if(email && password && username){
        if (!isValidPassword(password)){
          Session.set('errorMsg', 'Password must be 6 characters or more')
        }else if(username.indexOf(' ') >= 0){
          Session.set('errorMsg', 'Username cannot contain spaces')
        }else{
          //console.log(emailTrimmed)
          Accounts.createUser({
            email: emailTrimmed, 
            password : password, 
            username : username, 
            profile:{
              email: emailTrimmed
            }
          }, function(err){
            if (err) {
              if(err == 'Error: Username already exists. [403]'){
                Session.set('errorMsg', 'Username is taken')
              }else{
                Session.set('errorMsg', 'Account already exists')
              }
              //console.log(err)
              
            } 
            else {
              mixpanel.track('Full sign up', {'Location': Session.get('sign-up-location')})
              mixpanel.identify(Meteor.userId());
              mixpanel.people.set({
                  "$name": Meteor.user().username,  
                  "$email": Meteor.user().emails[0].address,    
                  "$created": new Date(),
                  "$last_login": new Date(), 
                  "$username": Meteor.user().username,        
                  "Points": 0,
                  "Stars": 0                   
              },function(){
                $('.black-overlay .close').click()
                window.location.href = '/';
              });
              
            } 
          })
        }
        
      }else{
        if(email){
          Session.set('errorMsg', 'Field missing')
          $('.sign-up-input').each(function(){
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
      clearSessions()
      return false
    }
  })

    Template.forgot_password_overlay_tmpl.events({

        'submit #forgot-password-form' : function(e, t) {
          e.preventDefault()
          var email = trimInput(t.find('#email').value)

          if (email && validateEmail(email)) {
            Session.set('loading', true);
            Accounts.forgotPassword({email: email}, function(err){
              if (err){
                console.log(err)
                Session.set('errorMsg', 'Password Reset Error &amp; Doh')
              }
                
              else {
                //console.log('sent')
                Session.set('emailSent', true)
              }
              Session.set('loading', false);
            });
          }
          return false; 
        },

        'submit #new-password' : function(e, t) {
          e.preventDefault();
          var pw = t.find('#new-password-password').value;
          if (pw && isValidPassword(pw)) {
            Session.set('loading', true);
            Accounts.resetPassword(Session.get('resetPassword'), pw, function(err){
              if (err){
                if(err == 'Error: Token expired [403]'){
                  Session.set('errorMsg', 'Password was already reset');
                }else{
                  Session.set('errorMsg', 'Password Reset Error');
                }
              }else {
                Session.set('resetPassword', null);
                $('.black-overlay .close').click()
                Router.home();
              }
              Session.set('loading', false);
            });
          }else{
            Session.set('errorMsg', 'Password is too short');
          }
        return false; 
        }
    });
  

  Template.book_tmpl.events({
    'click .chapter-link' : function(e){
      $("#audio").jPlayer('stop')
      var self = this;
      mixpanel.track('Chapter select', {'Book':Session.get("bookName"),'Chapter':this.chapter}, function(){
        var bookName = Session.get("bookName").replace(' ', '')
        Router.navigate("/books/"+bookName+"/"+self.chapter,{trigger:true});
        $('html,body').scrollTop(0);
      });
      return false;
    },
    'click .chapter-questions-btn' : function(e){
      Session.set("questionVerseSelect", 'Questions')
      $("#questions-verses-container").empty()
      Blaze.render(Template.questions_tmpl, $('#questions-verses-container')[0])
      //UI.insert(UI.render(Template.questions_tmpl), document.getElementById('questions-verses-container'))
      return false;
    },
    'click .chapter-verses-btn' : function(e){
      Session.set("questionVerseSelect", 'Verses')
      $("#questions-verses-container").empty()
      Blaze.render(Template.verses_tmpl, $('#questions-verses-container')[0])
      //UI.insert(UI.render(Template.verses_tmpl), document.getElementById('questions-verses-container'))
      return false;
    },
    'click #audio-container .jp-play' : function(e){
      var t=setTimeout(function(){
        var totalTime = $('.jp-duration').html(); 
        addAudioCoins(Session.get("totalVerses"), totalTime, Session.get("bookName"), Session.get("chapterNum"))
      },2000)
    },
    'mouseover #chest-items span': function(e){
      var target = $(e.target)
      popupBubble(target, target.html());
    },
    'mouseout #chest-items span': function(e){
      $('.popup-bubble').remove()
    },
    'mouseover .badge': function(e){
      var target = $(e.target)
      popupBubble(target, target.html());
    },
    'mouseout .badge': function(e){
      $('.popup-bubble').remove()
    }
  })

  Template.star_overlay_tmpl.events({
    'click .next-chapter' : function(e){
      mixpanel.track('Next chapter select', {'Book':Session.get("bookName"), 'Next chapter':Session.get("chapterNum")+1}, function(){
        $('.overlay-content .close').click()
        if(Session.get("chapterNum") == Session.get("chapters")){
          if(Session.get("bookName") != 'Revelation'){
            var bookNumNext = bookNames.indexOf(Session.get("bookName")) + 1
            var nextBook = bookNames[bookNumNext].replace(" ", "")
            Router.navigate("/books/"+nextBook,{trigger:true});
          }
        }else{
          var nextChapter = Session.get("chapterNum")+1
          var bookName = Session.get("bookName").replace(' ', '')
          Router.navigate("/books/"+bookName+'/'+nextChapter,{trigger:true});
        }
        Session.set("questionVerseSelect", 'Verses')
        
        
        $('html,body').scrollTop(0);
      });
      
      return false;
    }
  })

  Template.book_complete_overlay_tmpl.events({
    'click .choose-reward' : function(e){
      $('.black-overlay, .finished-overlay').fadeOut(200, function(){})
      var book = Books.findOne({bookName: Session.get("bookName")})
      Session.set('completeBook', Session.get("bookName"))
      chestVerify(book)
      return false
    }
  })

  Template.finished_overlay_tmpl.events({
    'click .choose-reward' : function(e){
      $('.black-overlay, .finished-overlay').fadeOut(200, function(){})
      var book = Books.findOne({bookName: Session.get("bookName")})
      chestVerify(book)
      return false
    }
  })

  Template.questions_tmpl.events({
    'click .answer' : function(e){
      answerQuestion(e)
      
      return false;
    },
    'click .recycle-answer' : function(e){
      Meteor.call('recycleQuestion', this._id, Session.get("bookName"), function(error, result){
        if(result == 'noPoints'){
          $('.incorrect-answer .error').show().delay(3000).fadeOut()
        }
      })
      return false;
    },
    'click .special-recycler' : function(e){
      Meteor.call('recycleQuestion', this._id, Session.get("bookName"), 'special')
      $('.popup-bubble').remove()
      return false;
    },
    'mouseover .special-recycler': function(e){
      var target = $(e.currentTarget)
      var html = target.find('span').html()
      popupBubble(target, html);
    },
    'mouseout .special-recycler': function(e){
      $('.popup-bubble').remove()
    },
  })



  Template.chapters_tmpl.events({
    'click .book-box' : function(e){
      var self = this;
      mixpanel.track('Book select', {'Book':this.bookName}, function(){
        //console.log('in')
        var bookNameTrimmed = self.bookName.replace(" ", "")
        window.location.href = "/books/"+bookNameTrimmed;
      });
      return false;
    },
    'click .total-complete .book-lock' : function(e){
      chestVerify(this)
    },
    'click .book-lock' : function(){
      return false
    },
    'click .locked-book': function(){
      var prevBook = this.bookNum - 1;
      var book = Books.findOne({owner: Meteor.userId(), bookNum:prevBook})
      var stars = book.chapters - book.chaptersTotalComplete
      Session.set("unlockBookname", this.bookName)
      Session.set("unlockStars", stars)
      loadInOverlay('overlay-content')
      Blaze.render(Template.book_unlock_overlay_tmpl, $('.overlay-content')[0])
      //UI.insert(UI.render(Template.book_unlock_overlay_tmpl), document.getElementsByClassName('overlay-content')[0])
      return false
    }
  })

  Template.book_unlock_overlay_tmpl.events({
    'click .unlock-book' : function(){
      Meteor.call('unlockBook', Session.get("unlockBookname"), function(error, result){
        if(result == 'unlocked'){
          mixpanel.track('Book unlock', {'Book':Session.get("unlockBookname")}, function(){
            $('.black-overlay .close').click()
          });
        }
      })
      return false
    },
    'click .unlock-book-not-enough' : function(){
      return false
    }
  })

  Template.chest_overlay_tmpl.events({
    'click .choose-item' : function(e){
      var item = $(e.target).attr('data-item-num')
      if($(e.target).parents('.choice').hasClass('complete')){
        return false
      }else{
        $('.choice').addClass('complete')
        $(e.target).html('Chosen').removeClass('gray-gradient').addClass('chosen')
        $(e.target).parents('.choice').addClass('active')
        //console.log(item)
        Meteor.call('chestSelect', Session.get('chapterID'), item, function (error, result) { 
          mixpanel.track('Special item', {'Item':result})
          //console.log(result)
          // loadInOverlay('chest-content')
          // $('.chest-content').append(UI.render(Template.chest_overlay_tmpl))
        })
        if(Session.get('completeBook')){
          $('.all-choices-mobile').css('margin-bottom', '30px');
          $('.all-choices-mobile .bx-controls').hide()
          $('.chest-content a.next-book').fadeIn().css('display', 'inline-block');
        }
      }
      return false
    },
    'click .next' : function(e){
      slidey.goToNextSlide();
      return false;
    },
    'click .prev' : function(e){
      slidey.goToPrevSlide();
      return false;
    },
    'click .next-book' : function(e){
      $('.overlay-content .close').click()
      var bookNumNext = bookNames.indexOf(Session.get("bookName")) + 1
      var nextBook = bookNames[bookNumNext].replace(" ", "")
      Router.navigate("/books/"+nextBook,{trigger:true});
      return false;
    }
  })

  Template.admin_tmpl.events({
    'mouseover .graphBarbar-graph': function(e){
      var target = $(e.target)
      var html = target.prev().html()
      popupBubble($(e.target), html);
    },
    'mouseout .graphBarbar-graph': function(e){
      $('.popup-bubble').remove()
    },
    'click .export-signup-emails': function(){
      $('.admin-container').empty()
      Blaze.render(Template.signup_email_tmpl, $('.admin-container')[0])
      //UI.insert(UI.render(Template.signup_email_tmpl), document.getElementsByClassName('admin-container')[0])
    },
    'click .export-user-emails': function(){
      $('.admin-container').empty()
      Blaze.render(Template.user_email_tmpl, $('.admin-container')[0])
      //UI.insert(UI.render(Template.user_email_tmpl), document.getElementsByClassName('admin-container')[0])
    }
  })

  Template.search_user_tmpl.events({
    'submit #search-user' : function(e){
      var searchVal = $('#user-input-search').val()
      search(searchVal)
      return false
    },
    'click .invite-friends': function(e){
      mixpanel.track('Invite friends')
      FacebookInviteFriends()
      return false
    },
    'click .follow-user': function(e){
      //var userID = Meteor.users.findOne({'username':$(e.target).attr('data-username')})._id
      var self = $(e.target)
      if(self.hasClass('green-gradient')){
        self.removeClass('green-gradient')
        self.html('Follow')
      }else{
        self.addClass('green-gradient')
        self.html('Following')
      }
      Meteor.call('followUser', self.attr('data-user'))
      return false
    }
  })

  Template.public_profile_tmpl.events({
    'click .follow-user': function(e){
      Meteor.call('followUser', Session.get('profileID'))
      return false
    },
    'click .like': function(e){
      $('.popup-bubble').remove()
      Meteor.call('likeActivity', this._id)
      return false
    },
    'mouseover .like': function(e){
      $('.popup-bubble').remove()
      var names = $(e.currentTarget).find('b').html()
      if(names) popupBubble($(e.currentTarget), names);
      return false
    },
    'mouseout .like': function(e){
      $('.popup-bubble').remove()
    }
  })

  // --------- ROUTING ---------- //
  var versesRouter = Backbone.Router.extend({
    routes: {
      "books/:bookName/:chapterNum": "book",
      "books/:bookName": "book",
      "account?e=:token": "account",
      "account": "account",
      "billing": "billing",
      "profile": "profile",
      "donate": "donate",
      "privacy": "privacy",
      "mobile": "mobile",
      "reset-password/:token": "resetPassword",
      "admin": "admin",
      "home": "home",
      "search?q=:keyword" : "search",
      "search?q=" : "search",
      "search" : "search",
      "u/:username": "publicProfile",
      "i/:invoiceId": "invoice",
      "/": "home",
      "?fb_source=:item": "home",
      "": "home",
      '404': 'notFound',
      '*notFound': 'notFound'
    },
    book: function (bookName, chapterNum) {
      if(Meteor.userId()){
        loadingPage()
        mixpanel.identify(Meteor.userId());
        $("#site-container").empty()
        var bookName = bookName.replace(/(\d)/g, "$1 ")
        var bookInfo;
        Meteor.subscribe( "books_db", function() {
          bookInfo = Books.findOne({bookName: bookName, owner: Meteor.userId()})
          if(Chapters.find({bookName: bookName, owner: Meteor.userId()}).count() == 0){
            Meteor.call('chapterInitialize', bookInfo.bookName)
          }
          Session.set("bookName", bookInfo.bookName);
          Session.set("chapters", bookInfo.chapters);
        })
        //var booknameRaw = bookInfo.bookname
        // var booknameTrimmed = booknameRaw.replace(" ", "")
        Meteor.subscribe( "chapters_db", function() {
          
          if(chapterNum){
            var number = parseInt(chapterNum)
            var setChapterNumber = Chapters.findOne({bookName:bookName, chapter:number, owner: Meteor.userId()}, {sort:{chapter:1}});
          }else{
            var setChapterNumber = Chapters.findOne({bookName:bookName, totalComplete: false, owner: Meteor.userId()}, {sort:{chapter:1}});
            if(!setChapterNumber){
              var setChapterNumber = Chapters.findOne({bookName:bookName, chapter:1 , owner: Meteor.userId()}, {sort:{chapter:1}});
            }
          }
          //console.log(setChapterNumber)
          $('#'+setChapterNumber._id).addClass('selected')
          Session.set("chapterID", setChapterNumber._id)
          Session.set("chapterNum", setChapterNumber.chapter)
          Session.set("verseAudioBegin", '')
          Session.set('backgroundColor', bookColors[bookNames.indexOf(bookName)])
          Session.set("totalVerses", setChapterNumber.verses)
          Session.set("bookId", bookIds[bookInfo.bookNum])
          Session.set("verseText", '')
          Session.set("verseTextLoaded", false)
          Session.set("verseAudioLoaded", false)
          //console.log(setChapterNumber.verses)
          //console.log(setChapterNumber.chapter)
          //var result = Backbone.history.fragment.substring(Backbone.history.fragment.lastIndexOf("/")+ 1);
          //console.log(result)
          Meteor.call('ajaxAudio', bookIds[bookInfo.bookNum], setChapterNumber.chapter, function(error, result){
            Session.set("audioFile", result)
            Session.set("verseAudioLoaded", true)
            audioInitiate()
          })
          Meteor.call('ajaxText', Session.get("bookId"), Session.get("chapterNum"), function(error, result){
            Session.set("verseText", result)
            Session.set("verseTextLoaded", true)
          })
          ajaxChapterInfo(setChapterNumber)
          $("#site-container").empty()
          Blaze.render(Template.book_tmpl, $('#site-container')[0])
          //UI.insert(UI.render(Template.book_tmpl), document.getElementById('site-container'))
          Meteor.call('questionsInitialize', setChapterNumber.chapter, bookName)
          var bookNameTrimmed = bookName.replace(" ", "")
          var bookNameRep = bookName.replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
          Session.set("bookNameRep", bookNameRep);
          // Router.navigate("books/"+bookNameTrimmed+"/"+setChapterNumber.chapter,{trigger:true, replace: true});
          pageLoaded() //now loads after text is loaded Template.verses_tmpl.verseTextLoaded
          Router.navigate("books/"+bookNameTrimmed+"/"+setChapterNumber.chapter,{replace:true});
        })
      }else{
        $("#site-container").empty()
        Blaze.render(Template.landing_tmpl, $('body')[0])
        //UI.insert(UI.render(Template.landing_tmpl), document.body)
        this.navigate("/");
      }
    },
    home: function(item){
      if(Meteor.userId()){
        loadingPage()
        mixpanel.identify(Meteor.userId());
        Meteor.subscribe("userdata", function() {
          pageLoaded()
        })
        $("body").empty()
        Blaze.render(Template.chapters_page_tmpl, $('body')[0])
        //UI.insert(UI.render(Template.chapters_page_tmpl), document.body)
      }else{
        pageLoaded()
        $("body").empty()
        Blaze.render(Template.landing_tmpl, $('body')[0])
        //UI.insert(UI.render(Template.landing_tmpl), document.body)
      }
      this.navigate("/");
    },
    donate: function(){
      pageLoaded()
      if(Meteor.userId()){
        mixpanel.identify(Meteor.userId());
      }
      mixpanel.track('Donation page',{'Step':'Landed'})
      $("#site-container").empty()
      Blaze.render(Template.donate_tmpl, $('#site-container')[0])
      //UI.insert(UI.render(Template.donate_tmpl), document.getElementById('site-container'))
      this.navigate("/donate");
    },
    privacy: function(){
      pageLoaded()
      $("#site-container").empty()
      Blaze.render(Template.privacy_tmpl, $('#site-container')[0])
      //UI.insert(UI.render(Template.privacy_tmpl), document.getElementById('site-container'))
      this.navigate("/privacy");
    },
    account: function(token){
      loadingPage()
      if(Meteor.userId()){
        mixpanel.identify(Meteor.userId());
        Session.set('emailVerify', false)
        Session.set('verEmailSent', false)
        Session.set('profileID', Meteor.userId())
        Meteor.subscribe("userdata", function() {
        pageLoaded()
          //console.log('account')
          $("#site-container").empty()
          Blaze.render(Template.account_tmpl, $('#site-container')[0])
          //UI.insert(UI.render(Template.account_tmpl), document.getElementById('site-container'))
        })

        if(token){
          Accounts.verifyEmail(token, function(){
            Session.set('emailVerify', true)
            Router.navigate("/account?e="+token);
          })
        }else{
          this.navigate("/account");
        }
        
      }else{
        pageLoaded()
        Router.notFound();
      }
    },
    billing: function(){
      loadingPage()
      if(Meteor.userId()){
        mixpanel.identify(Meteor.userId());
        Meteor.subscribe("donations_db", function() {
          if(Donations.findOne({owner: Meteor.userId()})){
            Session.set('profileID', Meteor.userId())
            Meteor.subscribe("userdata", function() {
              $("#site-container").empty()
              Blaze.render(Template.billing_page_tmpl, $('#site-container')[0])
              //UI.insert(UI.render(Template.billing_page_tmpl), document.getElementById('site-container'))
              $('.account-nav').removeClass('selected')
              $('#billing-info-link').addClass('selected')
              pageLoaded()
            })
            Router.navigate("/billing");
          }else{
            Router.account();
          }
        })
      }else{
        pageLoaded()
        Router.notFound();
      }
    },
    invoice: function(invoiceId){
      loadingPage()
      if(Meteor.userId()){
        mixpanel.identify(Meteor.userId());
        Meteor.subscribe("donations_db", function() {
          if(Donations.findOne({owner: Meteor.userId()})){
            Session.set('profileID', Meteor.userId())
            Session.set('chargeId', invoiceId)
            Meteor.subscribe("userdata", function() {
              $("#site-container").empty()
              Blaze.render(Template.invoice_page_tmpl, $('#site-container')[0])
              //UI.insert(UI.render(Template.invoice_page_tmpl), document.getElementById('site-container'))
              $('.account-nav').removeClass('selected')
              $('#billing-info-link').addClass('selected')
              pageLoaded()
            })
            Router.navigate("/i/"+invoiceId);
          }else{
            pageLoaded()
            Router.account();
          }
        })
      }else{
        pageLoaded()
        Router.notFound();
      }
    },
    profile: function(){
      loadingPage()
      if(Meteor.userId()){
        mixpanel.identify(Meteor.userId());
        Session.set('profileID', Meteor.userId())
        Meteor.subscribe("userdata", function() {
          $("#site-container").empty()
          Blaze.render(Template.activity_page_tmpl, $('#site-container')[0])
          //UI.insert(UI.render(Template.activity_page_tmpl), document.getElementById('site-container'))
          $('.account-nav').removeClass('selected')
          $('#activity-info-link').addClass('selected')
          pageLoaded()
        })
        this.navigate("/profile");
      }else{
        pageLoaded()
        Router.notFound();
      }
    },
    search: function(keyword){
      pageLoaded()
      if(Meteor.userId()){
        mixpanel.identify(Meteor.userId());
      }
      $("#site-container").empty()
      Blaze.render(Template.search_user_tmpl, $('#site-container')[0])
      //UI.insert(UI.render(Template.search_user_tmpl), document.getElementById('site-container'))
      if(keyword){
        $('#user-input-search').val(keyword)
        search(keyword)
        //console.log(keyword)
      }
      if(!keyword){
        keyword = ''
        Session.set('userSearchLoaded', true)
      }
      this.navigate("/search?q="+keyword);
    },
    publicProfile: function(username){
      loadingPage()
      if(Meteor.userId()){
        mixpanel.identify(Meteor.userId());
      }
      Session.set('publicUsername', username)
      Meteor.subscribe("publicdata", username, function(){
        Session.set('profileID', Meteor.users.findOne({'username':username})._id)
        if(Meteor.userId() == Session.get('profileID')){
          Meteor.subscribe("userdata", function() {
            pageLoaded()
            $("#site-container").empty()
            Blaze.render(Template.account_tmpl, $('#site-container')[0])
            //UI.insert(UI.render(Template.account_tmpl), document.getElementById('site-container'))
            $("#lower-right").empty()
            Blaze.render(Template.activity_tmpl, $('#lower-right')[0])
            //UI.insert(UI.render(Template.activity_tmpl), document.getElementById('lower-right'))
            $('.account-nav').removeClass('selected')
            $('#activity-info-link').addClass('selected')
          })
        }else{
          if(Meteor.users.findOne({'username':username})){
            Meteor.subscribe("publicpoints", Session.get('profileID'), function(){
              Meteor.subscribe("publicactivity", Session.get('profileID'), function(){
                Meteor.subscribe("publicbooks", Session.get('profileID'), function(){
                  pageLoaded()
                  $("#site-container").empty()
                  Blaze.render(Template.public_profile_tmpl, $('#site-container')[0])
                  //UI.insert(UI.render(Template.public_profile_tmpl), document.getElementById('site-container'))
                })
              })
            })
          }else{
            pageLoaded()
            Router.notFound();
          }
        }
        
      })
    },
    notFound: function(path){
      pageLoaded()
      console.log(path)
      $("#site-container").empty()
      Blaze.render(Template.not_found_tmpl, $('#site-container')[0])
      //UI.insert(UI.render(Template.not_found_tmpl), document.getElementById('site-container'))
      this.navigate("/404");
    },
    resetPassword: function(token){
      pageLoaded()
      Session.set('resetPassword', token);
      $("body").empty()
      Blaze.render(Template.landing_tmpl, $('body')[0])
      loadInOverlay('overlay-content')
      $("#site-container").empty()
      Blaze.render(Template.forgot_password_overlay_tmpl, $('#site-container')[0])
      //UI.insert(UI.render(Template.forgot_password_overlay_tmpl), document.getElementById('site-container'))
      //this.navigate("/404");
    },
    admin: function(){

      $("#site-container").empty()
      Meteor.subscribe("userdata", function() {
        if(Meteor.userId()){
          if(Meteor.user().profile.admin){
            pageLoaded()
            $("#site-container").empty()
            Blaze.render(Template.admin_tmpl, $('#site-container')[0])
            //UI.insert(UI.render(Template.admin_tmpl), document.getElementById('site-container'))
          }
        }else{
          pageLoaded()
          Router.notFound();
        }
      })
      
    },
    mobile: function(){
      loadingPage()
      if(Meteor.userId()){
        loadingPage()
        mixpanel.identify(Meteor.userId());
        Meteor.subscribe("userdata", function() {
          pageLoaded()
        })
        $("body").empty()
        Blaze.render(Template.chapters_page_tmpl, $('body')[0])
        //UI.insert(UI.render(Template.chapters_page_tmpl), document.body)
      }else{
        pageLoaded()
        $("body").empty()
        UI.insert(UI.render(Template.mobile_login_tmpl), document.body)
      }
    }
  });

  Router = new versesRouter;

  Meteor.startup(function () {
    Backbone.history.start({pushState: true});
  });
// --------- ROUTING END ---------- //

}


