if(Meteor.isServer) {
  var bookNames = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']
  //var Stripe = StripeAPI(null);
  // http://www.digitalbibleplatform.com/developer
  var dbt_key = '3d8f48c34b05474b930a8f4e0fe4af40';
  var dam_audio_id = 'ENGESVN2DA';
  var dam_text_id = 'ENGESVN2ET';
  Future = Npm.require('fibers/future');

  process.env.MAIL_URL="smtp://AKIAICTUXIAAMYH4G5UA:Apnt1cIblqZ%2BWuYDEAOx46RADO%2FCVT6f0JLuhx8rCVs9@email-smtp.us-east-1.amazonaws.com:465"; 
  Accounts.emailTemplates.siteName = "Verses";
  Accounts.emailTemplates.from = "Verses <no-reply@joinverses.com>";

  Meteor.startup(function () {
    Accounts.loginServiceConfiguration.remove({
      service: "facebook"
    });

    Accounts.loginServiceConfiguration.insert({
      service: "facebook",
      appId: "1387339228187004",
      secret: "6897c6ab882ba7ec38e4dc11afa206a6"
    });
  });

  Accounts.emailTemplates.resetPassword.subject = function (user) {
      return "Reset your password";
  };
  Accounts.emailTemplates.resetPassword.text = function (user, url) {
    var name;
    if(user.profile.name){
      name = user.profile.name
    }else{
      name = user.username
    }

    url = url.replace(/\/\#/g, '')
    var html = "Hi "+name+"\n\n"
      + "To reset your password use the following link:\n"
      +url+"\n\n"
      +"Regards,\n"
      +"The Verses team"
     return html
  };

  Accounts.emailTemplates.verifyEmail.subject = function (user) {
      return "Verify your email";
  };
  Accounts.emailTemplates.verifyEmail.text = function (user, url) {

    url = url.replace(/\/\#\/verify\-email\//g, '/account?e=')
    var html = "Hi,\n\n"
      + "To verify your account email, simply click the link below:\n"
      +url+"\n\n"
      +"Regards,\n"
      +"The Verses team"
     return html
  };
  Accounts.onCreateUser(function(options, user) {
    var currentdate = new Date()
    var profileCreated = currentdate.getDate() + " " + monthNames[(currentdate.getMonth())]  + ", "  + currentdate.getFullYear()
      
    if (options.profile) {
      //Facebook credentials
      if(user.services.facebook){
        var usernameTrim
        if(user.services.facebook.username){
          usernameTrim = user.services.facebook.username
        }else{
          usernameTrim = user.services.facebook.name.replace(" ",".")
        }
        
        user.emails = [{'address':user.services.facebook.email,'verified':false}];
        user.username = usernameTrim;
      }

      options.profile.avatar = "blank.jpg";
      options.profile.version = "jsonBooks";
      options.profile.progress = 0;
      options.profile.finished = 0;
      options.profile.progressPercent = 0;
      options.profile.completedChapters = 0;
      options.profile.bookSuggest = "Matthew";
      options.profile.newUser = true;
      options.profile.bio = '';
      options.profile.created = profileCreated;
      user.profile = options.profile;
    }
    Activity.insert({owner: user._id, like:[], joined: user._id, date:currentdate.toISOString()})
    return user;
  });
  var bookChapters = [28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22]
  var questionAnswers = {
    'Matthew':[[],[,2,3,2],[,2,3,2],[,2,4,3],[,3,1,3],[,2,3,2],[,2,3,3],[,3,2,4],[,1,3,3],[,3,2,4],[,4,2,2],[,3,2,4],[,3,2,2],[,3,2,4],[,4,3,2],[,1,2,3],[,1,3,4],[,4,3,4],[,3,2,4],[,1,3,3],[,4,3,1],[,4,2,3],[,2,4,3],[,4,2,3],[,3,1,4],[,4,3,2],[,4,3,2],[,4,3,1],[,1,3,3]], 
    'Mark':[[],[,4,2,1],[,1,3,2],[,4,3,1],[,3,4,1],[,3,2,3],[,1,3,4],[,3,2,4],[,1,4,1],[,3,1,1],[,2,3,4],[,4,1,3],[,1,3,3],[,2,3,3],[,3,1,3],[,3,2,2],[,2,1,4]],
    'Luke':[[],[,3,4,3],[,2,1,4],[,4,2,2],[,4,4,1],[,2,3,4],[,3,3,4],[,3,4,1],[,1,2,4],[,4,4,1],[,3,4,2],[,1,1,2],[,3,2,2],[,1,4,2],[,2,4,3],[,3,3,2],[,4,2,5],[,3,2,4],[,4,3,3],[,3,1,3],[,4,2,2],[,4,2,1],[,3,4,3],[,2,1,3],[,4,2,1]],
    'John':[[],[,3,4,2],[,4,1,2],[,4,3,1],[,3,2,2],[,4,2,4],[,4,4,1],[,4,1,2],[,2,3,4],[,4,2,4],[,4,3,3],[,1,2,4],[,3,3,4],[,3,1,4],[,3,5,3],[,4,1,3],[,3,2,3],[,2,3,1],[,3,3,2],[,2,3,3],[,4,2,2],[,2,3,1]],
    'Acts':[[],[,2,5,4],[,3,3,1],[,4,1,4],[,3,1,4],[,2,2,3],[,4,4,1],[,3,5,2],[,2,4,4],[,3,3,1],[,4,3,2],[,3,4,3],[,1,1,2],[,5,4,1],[,1,2,2],[,4,2,4],[,4,1,3],[,1,5,2],[,4,2,3],[,5,1,3],[,2,3,1],[,4,1,2],[,2,4,2],[,1,4,2],[,5,3,2],[,3,4,2],[,3,3,2],[,1,2,2],[,3,3,2]],
    'Romans':[[],[,2,1,4],[,2,3,3],[,4,3,2],[,2,3,2],[,3,4,4],[,3,4,3],[,3,2,2],[,1,2,3],[,5,1,3],[,3,5,2],[,3,4,2],[,3,3,4],[,2,1,4],[,5,1,2],[,3,3,3],[,1,4,3]],
    '1 Corinthians':[[],[,2,5,3],[,2,3,4],[,4,2,2],[,3,2,4],[,3,4,2],[,2,3,4],[,1,3,2],[,4,2,3],[,4,2,3],[,3,3,2],[,1,2,3],[,4,2,4],[,1,3,3],[,4,4,3],[,4,3,2],[,2,2,3]],
    '2 Corinthians':[[],[,3,2,1],[,3,5,2],[,3,2,4],[,5,3,2],[,2,2,1],[,3,2,2],[,1,2,3],[,4,3,4],[,2,4,1],[,2,2,4],[,2,3,3],[,1,3,1],[,2,3,2]],
    'Galatians':[[],[,2,1,1],[,5,4,2],[,2,1,3],[,2,2,4],[,1,2,3],[,3,1,3]],
    'Ephesians':[[],[,3,3,3],[,2,3,1],[,3,1,4],[,3,1,2],[,3,2,3],[,4,2,2]],
    'Philippians':[[],[,4,2,3],[,3,2,2],[,3,2,5],[,3,1,2]],
    'Colossians':[[],[,3,4,2],[,2,2,3],[,5,2,3],[,3,2,2]],
    '1 Thessalonians':[[],[,3,2,4],[,5,3,1],[,4,2,2],[,2,3,2],[,2,3,1]],
    '2 Thessalonians':[[],[,3,1,2],[,3,5,1],[,1,4,3]],
    '1 Timothy':[[],[,3,5,1],[,4,2,1],[,2,3,1],[,3,4,2],[,3,2,1],[,4,3,4]],
    '2 Timothy':[[],[,2,1,3],[,3,2,4],[,4,3,1],[,3,3,4]],
    'Titus':[[],[,2,5,2],[,2,3,2],[,3,4,1]],
    'Philemon':[[],[,1,2,4]],
    'Hebrews':[[],[,3,4,3],[,4,3,2],[,1,2,2],[,3,2,1],[,3,2,2],[,4,1,3],[,3,5,2],[,3,2,3],[,2,4,1],[,1,2,2],[,3,2,5],[,3,1,3],[,2,1,3]],
    'James':[[],[,3,3,2],[,2,3,2],[,3,2,3],[,3,4,2],[,2,3,4]],
    '1 Peter':[[],[,4,3,2],[,1,4,2],[,1,3,4],[,3,3,4],[,4,5,2]],
    '2 Peter':[[],[,3,4,2],[,1,3,3],[,2,3,1]],
    '1 John':[[],[,3,2,1],[,2,4,2],[,2,4,3],[,2,3,1],[,4,1,3]],
    '2 John':[[],[,1,3,1]],
    '3 John':[[],[,2,4,1]],
    'Jude':[[],[,4,2,4]],
    'Revelation':[[],[,4,1,4],[,1,3,3],[,2,3,1],[,5,4,3],[,4,3,3],[,4,2,4],[,4,3,2],[,2,3,2],[,3,3,3],[,2,3,2],[,2,1,5],[,4,3,3],[,5,2,1],[,4,3,4],[,3,3,2],[,5,3,2],[,3,4,1],[,3,4,3],[,5,4,3],[,1,4,3],[,2,4,3],[,3,1,3]],
    'demo': [[],[,4]]
  }



  Meteor.methods({
    createBooks: function(){
      if(Books.find({bookName: 'Matthew', owner: Meteor.userId()}).count() == 0){
          for (var i=0; i<=26; i++){

            var bookUnlocked = false;

            if(bookNames[i] == 'Matthew'){
              bookUnlocked = true;
            }

            Books.insert({
              bookNum: i,
              bookName: bookNames[i],
              chapters: bookChapters[i],
              complete: false,
              totalComplete: false,
              bookCoinsEarned: 0,
              chaptersComplete: 0,
              chaptersTotalComplete: 0,
              spent:false,
              item: 0,
              all: 0,
              unlocked:bookUnlocked,
              owner: Meteor.userId()
            })
          }

          /*Demo book*/

          Books.insert({
            bookNum: 27,
            bookName: 'demo',
            chapters: 1,
            complete: false,
            totalComplete: false,
            bookCoinsEarned: 0,
            chaptersComplete: 0,
            chaptersTotalComplete: 0,
            owner: Meteor.userId()
          })

          Chapters.insert({
            bookName: 'demo',
            chapter: 1,
            verses: 50,
            complete: false,
            totalComplete: false,
            coinsAccumulated: 0,
            correctAnswers:0,
            owner: Meteor.userId()
          })

          Questions.insert({
            bookName: 'demo',
            chapter: 1,
            question: 1,
            answer: 0,
            pointsAquired: 0,
            pointsRemaining: 30,
            lives: 2,
            complete: false,
            allIncorrect: false,
            owner: Meteor.userId()
          })

          var timeStamp = new Date();

          Notification.insert({
            name: 'coin',
            type: 'shop',
            seen: false,
            date: timeStamp,
            owner: Meteor.userId()
          })

          /*End Demo book*/

          // for(var a=0; a<giftsArray.length; a++){
          //   Gifts.insert({
          //     gift:a,
          //     booksToUnlock: giftsArray[a],
          //     unlocked: false,
          //     giftsCoin:giftsCoin[a],
          //     spent:false,
          //     owner: Meteor.userId()
          //   })
          // }
          // for(var b=0; b<chestsArray.length; b++){
          //   Chests.insert({
          //     chest:b,
          //     booksToUnlock: chestsArray[b],
          //     keysNeeded: keysNeeded[b],
          //     unlocked: false,
          //     spent:false,
          //     item: 0,
          //     all: 0,
          //     owner: Meteor.userId()
          //   })
          // }
        }
    },
    answerSelect: function (bookName, chapter, answer, question, self, callback){
      var questionNumber = parseInt(question)
      var questionPoint = Questions.findOne({question: questionNumber, chapter: chapter, bookName: bookName, owner: Meteor.userId()});
      var chapterCorrect = Chapters.findOne({chapter: chapter, bookName: bookName, owner: Meteor.userId()});
      var addToBookCompletion = Books.findOne({bookName: bookName, owner: Meteor.userId()});
      var returnComplete = 'complete'
     
      if(questionAnswers[bookName][chapter][question] != answer && questionPoint.complete == false){

        if(questionPoint.lives > 0 && questionPoint.lives != 1){
          //Wrong answer lose one life and 25 points
          Meteor.call('wrongAnswer', questionPoint)
          return [questionPoint._id, questionPoint.lives, 'wrongAnswer']
          
        }
        else if(questionPoint.lives == 1){
          //Wrong answer final, lose one life and 25 points and complete question
          Meteor.call('wrongAnswerEnd', questionPoint)
          return [questionPoint._id, questionPoint.lives, 'wrongAnswer']
        }

      }
      else if(questionAnswers[bookName][chapter][question] == answer && questionPoint.lives > 0 && questionPoint.complete == false){
        
        //Correct answer, gain coins remaining and complete question
        //Meteor.call('questionCompleted', questionPoint, answer)
        var answerNum = parseInt(answer)
        var pointsRemaining = questionPoint.pointsRemaining
        if(ChestItems.findOne({owner: Meteor.userId(), doubler:{"$exists":true}})){
          var doubler = ChestItems.findOne({owner: Meteor.userId(), doubler:{"$exists":true}})
          if(doubler.doubler > 1){
            pointsRemaining = pointsRemaining * 2
            ChestItems.update(doubler, {$inc:{doubler:-1}})
          }else{
            pointsRemaining = pointsRemaining * 2
            ChestItems.remove(doubler)
          }
        }
        Questions.update(questionPoint, {$set: {complete:true, answer:answerNum, pointsAquired: pointsRemaining}})
        Meteor.call('progressInc')
        if(chapterCorrect.correctAnswers<3){
          if(chapterCorrect.correctAnswers!=2){
            Meteor.call('correctAnswer', chapterCorrect)
          }
          else if(chapterCorrect.correctAnswers==2){

            var chaptersLessOne = parseInt(addToBookCompletion.chapters)-1
            var allChaptersComplete = false
            
            if(addToBookCompletion.chaptersTotalComplete == chaptersLessOne){
              var allChaptersComplete = true
              var giftIndex = -1;
              var chestIndex = -1;
              for (var i = 0; i < giftsArray.length; i++) {
                for (var y = 0; y < giftsArray[i].length; y++) {
                  if (giftsArray[i][y] == addToBookCompletion.bookNum) {
                    giftIndex = i;
                    break;
                  }
                }
              }
              for (var a = 0; a < chestsArray.length; a++) {
                for (var b = 0; b < chestsArray[a].length; b++) {
                  if (chestsArray[a][b] == addToBookCompletion.bookNum) {
                    chestIndex = a;
                    break;
                  }
                }
              }
              Meteor.call('unlockChest', chestIndex)
              Meteor.call('unlockGift', giftIndex)
            }
            var timeStamp = new Date();
            Meteor.call('activityPoints', 0, "chapterComplete", timeStamp, bookName, chapter, chapter)
            Meteor.call('correctAnswerAll', chapterCorrect, addToBookCompletion, allChaptersComplete, bookName)
            if(Books.find({owner: Meteor.userId(), totalComplete:true}).count() == 27){
              Meteor.call('newTestamentComplete')
              returnComplete = 'newTestamentComplete'
            }else{
              returnComplete = 'completeAll'
            }
            
          }
          
        }
        if(chapterCorrect.correctAnswers==3){
          Meteor.call('completeChapter', chapterCorrect)
        }
        var timeStamp = new Date();

        var point = Points.findOne({owner: Meteor.userId()});
        var book = Books.findOne({owner: Meteor.userId(), bookName: bookName});
        
        //Chest doubler item
        
        Points.update(point, {$inc: {total: pointsRemaining}});
        Books.update(book, {$inc: {bookCoinsEarned: pointsRemaining}})

        Meteor.call('activityPoints', pointsRemaining, "correctAnswers", timeStamp, bookName, chapter, 0)
        return [questionPoint._id, pointsRemaining, returnComplete]
        //animateLargeCoin(questionPoint._id, questionPoint.pointsRemaining)
      }
    },
    correctAnswerAll: function(chapterCorrect, addToBookCompletion, allChaptersComplete, bookName){
      var chaptersLessOne = parseInt(addToBookCompletion.chapters)-1
      var point = Points.findOne({owner: Meteor.userId()});
      var timeStamp = new Date();
      //console.log('true')
      Chapters.update(chapterCorrect, {$inc: {correctAnswers:+1}, $set: {totalComplete:true, complete:true}})
      if(addToBookCompletion.chaptersTotalComplete == chaptersLessOne){
        Points.update(point, {$inc: {stars: +1}});
        Meteor.call('progressInc', true)
        Activity.insert({owner: Meteor.userId(), like: [], bookComplete:bookName, date:timeStamp.toISOString()})
        Books.update(addToBookCompletion, {$inc: {chaptersTotalComplete:+1}, $set: {totalComplete:true, complete:true, completeDate:timeStamp.toISOString()}})
        //var giftUnlock = Gifts.findOne({gift:addToBookCompletion.bookNum, , owner: Meteor.userId()})
        //Gifts.update(giftUnlock, {$set:{unlocked:true}})
        var bookIndex = bookNames.indexOf(bookName) + 1
        var newBook = bookNames[bookIndex]
        var unlockBook = Books.findOne({owner: Meteor.userId(), bookName:newBook})._id
        Books.update({_id:unlockBook}, {$set:{unlocked:true}})
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{'profile.bookSuggest': newBook}})

        //Store notifications
        var completeBookCount = Books.find({owner: Meteor.userId(),totalComplete:true}).count()
        if(addToBookCompletion.bookName == 'Matthew'){
          Notification.insert({
            name: 'matthew',
            type: 'shop',
            seen: false,
            date: timeStamp,
            owner: Meteor.userId()
          })
        }
        if(completeBookCount == 3){
          Notification.insert({
            name: 'threeBooks',
            type: 'shop',
            seen: false,
            date: timeStamp,
            owner: Meteor.userId()
          })
        }else if(completeBookCount == 9){
          Notification.insert({
            name: 'nineBooks',
            type: 'shop',
            seen: false,
            date: timeStamp,
            owner: Meteor.userId()
          })
        }else if(completeBookCount == 12){
          Notification.insert({
            name: 'twelveBooks',
            type: 'shop',
            seen: false,
            date: timeStamp,
            owner: Meteor.userId()
          })
        }
      }else{
        //chaptersComplete:+1
        Points.update(point, {$inc: {stars: +1}});
        Books.update(addToBookCompletion, {$inc: {chaptersTotalComplete:+1}})
        Meteor.call('progressInc', true)
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{'profile.bookSuggest': bookName}})
      }
    },
    updateProfile: function(profileName, profileEmail, profileUsername, profileBio, profileBibleVersion, callback){
      var fut = new Future();
      var pattern = /[^\w\s]/g;
      var emailPattern = /^\s*|\s*$/g;
      profileName = profileName.replace(pattern, "");
      profileEmail = profileEmail.replace(emailPattern, "");
      profileUsername = profileUsername.replace(pattern, "");
      profileBio = profileBio.replace(pattern, "");
      profileBibleVersion = profileBibleVersion.replace(pattern, "");
      var emailVerified = Meteor.user().emails[0].verified

      if(Meteor.user().emails[0].address != profileEmail){
        emailVerified = false
      }

      var email = validateEmail(profileEmail)
      if(email){
        if(profileUsername.indexOf(' ') >= 0){
          return 'usernameError'
        }
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{username: profileUsername, 'profile.name':profileName, 'emails.0.address':profileEmail,'emails.0.verified':emailVerified,'profile.bio':profileBio,'profile.version':profileBibleVersion}},function(error, result){
          fut['return'](result);
        })

        var result = fut.wait();
        return 'saved'
      }else{
        return 'emailError'
      }
    },
    updateNewUser: function(){
      Meteor.users.update({_id:Meteor.user()._id}, {$set:{'profile.newUser': false}})
    },
    chestVerify: function(book, callback){
      if(book.totalComplete){
        if(!book.all){
          var chestTmpl = new Array()
          var totalTmpls = 7
          var allChestItems = ChestItems.find({owner: Meteor.userId()}, {fields: {'item': 1}}).fetch()
          //console.log(allChestItems)
          var num = Math.floor(Math.random() * totalTmpls) + 1
          for(i=1;i<=3;i++){
            if(allChestItems.length){
              _.each(allChestItems, function(chestItem){
                  do{
                    num = Math.floor(Math.random() * totalTmpls) + 1
                  }while ((num == chestItem.item) || (inArray(num, chestTmpl)) );
              })
            }else{
              //console.log(num)
              do{
                num = Math.floor(Math.random() * totalTmpls) + 1
              }while ((inArray(num, chestTmpl)) );
            }
            
            //console.log(inArray(num, chestTmpl))
            chestTmpl.push(num) 
          }
          //console.log('item '+chestTmpl)
          Books.update(book, {$set:{all:chestTmpl}})
        }else{
          var chestTmpl = book.all
        }

        if(book.spent){
          return [book.item, true, chestTmpl]
        }else{
          return [0, true, chestTmpl]
          }
      }else{
        return [0,'unlockedError']
      }
    },
    checkChest: function(book, callback){
      //var chestNum = parseInt(chest.chest);
      //var bookPull = Books.findOne({bookNum: chestsArray[chestNum][0], owner: Meteor.userId()})
      //var bookPullTwo = Books.findOne({bookNum: chestsArray[chestNum][1], owner: Meteor.userId()})
      //var keysHave = Points.findOne({owner: Meteor.userId()}).keys
      //var chestTmpls = [[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6]]
      
      if(bookPull.totalComplete || bookPullTwo.totalComplete){
        //console.log(chestTmpls[chestNum])
        if(keysHave >= chest.keysNeeded || chest.spent){
          if(!chest.all){
            var chestTmpl = new Array()
            var totalTmpls = 7
            var allChestItems = ChestItems.find({owner: Meteor.userId()}, {fields: {'item': 1}}).fetch()
            var num = Math.floor(Math.random() * totalTmpls) + 1
            for(i=1;i<=3;i++){
              if(allChestItems.length){
                _.each(allChestItems, function(chestItem){
                    do{
                      num = Math.floor(Math.random() * totalTmpls) + 1
                    }while ((num == chestItem.item) || (inArray(num, chestTmpl)) );
                })
              }else{
                //console.log(num)
                do{
                  num = Math.floor(Math.random() * totalTmpls) + 1
                }while ((inArray(num, chestTmpl)) );
              }
              
              //console.log(inArray(num, chestTmpl))
              chestTmpl.push(num) 
            }
            //console.log('item '+chestTmpl)
            Chests.update(chest, {$set:{all:chestTmpl}})
          }else{
            var chestTmpl = chest.all
          }
          

          if(chest.spent){
            return [chest.item,true, chestTmpl]
          }else{
            return [0, true, chestTmpl]
          }
        }else{
          return [0,'keys']
        }
      }else{
        return [0,'unlockedError']
      }
    },
    checkStreak: function(offset){
      var streak = Streak.findOne({owner: Meteor.userId()})
      var date = new Date();
      var currentDateOffset = new Date(date.getTime() - offset);
      var currentDate = currentDateOffset.getDate();
      var currentDaysAdded = (currentDateOffset.getFullYear() * 12 + currentDateOffset.getMonth()) * 31 + currentDate
      var streakDate = streak.date.getDate();
      var streakDaysAdded = (streak.date.getFullYear() * 12 + streak.date.getMonth()) * 31 + streakDate
      //console.log(currentDateOffset.getFullYear() +' * '+ 12 +' + '+ currentDateOffset.getMonth() +' * '+ 30 +' + '+ currentDate)
      //console.log(streak.date.getFullYear() +' * '+ 12 +' + '+ streak.date.getMonth() +' * '+ 30 +' + '+ streakDate)
      //console.log('Check Current '+currentDaysAdded)
      //console.log('Check Streak '+streakDaysAdded)
      var endStreak = streakDaysAdded + 2;
      var oneStreak = streakDaysAdded + 1;
      var timeStamp = new Date(date.getTime() - offset);
      //console.log('Check '+currentDate +' == '+ streakDate)
      //console.log('Check '+currentDaysAdded +' == '+ streakDaysAdded)
      // var currentTime = new Date().getTime();
      // var streakTime = streak.date.getTime();
      // var difference = parseInt(currentTime-streakTime)
      if(currentDaysAdded >= endStreak){
        //console.log(currentDaysAdded+" is bigger or equal to "+streakDaysAdded)
        if(streak.days){
          Streak.update(streak, {$set:{days: 0, used: false}})
        }
      }else if(currentDaysAdded == oneStreak){
        Streak.update(streak, {$set:{used: false}})
      }
    },
    streakDateYesterday: function(offset){
      var date = new Date();
      //console.log(date)
      //date.setDate(date.getDate() - 1);
      var UTCDateOffset = new Date(date.getTime() - offset);
      console.log(UTCDateOffset.getDate() - 1)
      var updatedDate = new Date(UTCDateOffset.setDate(UTCDateOffset.getDate() - 1));
      console.log('Should be DATE '+updatedDate)
      var streak = Streak.findOne({owner: Meteor.userId()})
      Streak.update(streak, {$set:{used: false, date: updatedDate}})
      console.log(streak)
    },
    streakDateTwo: function(offset){
      var date = new Date();
      //console.log(date)
      //date.setDate(date.getDate() - 2);
      var UTCDateOffset = new Date(date.getTime() - offset);
      console.log(UTCDateOffset.getDate() - 2)
      var updatedDate = new Date(UTCDateOffset.setDate(UTCDateOffset.getDate() - 2));
      var streak = Streak.findOne({owner: Meteor.userId()})
      Streak.update(streak, {$set:{used: false, date: updatedDate}})
      //console.log(streak)
    },
    streakUpdate: function(offset, callback){
      var streak = Streak.findOne({owner: Meteor.userId()})
      var date = new Date();
      var currentDateOffset = new Date(date.getTime() - offset);
      var currentDate = currentDateOffset.getDate();
      var currentDaysAdded = (currentDateOffset.getFullYear() * 12 + currentDateOffset.getMonth()) * 31 + currentDate
      var streakDate = streak.date.getDate();
      var streakDaysAdded = (streak.date.getFullYear() * 12 + streak.date.getMonth()) * 31 + streakDate
      //console.log('Update streakDate '+streak.date)
      //console.log('Update Current'+currentDaysAdded)
      //console.log('Update Streak'+streakDaysAdded)
      var oneStreak = streakDaysAdded + 1;
      var twoStreak = streakDaysAdded + 2;
      var timeStamp = new Date(date.getTime() - offset);
      //console.log('Update '+currentDate +' == '+ streakDate)
      //console.log('Update '+currentDaysAdded +' == '+ oneStreak)
      //console.log(streak.used)
      if(currentDaysAdded == oneStreak && !streak.used){
        //console.log('One streak')
        var pointsEarned = (streak.days+1) * 50
        var point = Points.findOne({owner: Meteor.userId()});
        Points.update(point, {$inc: {total: +pointsEarned}});
        Streak.update(streak, {$inc:{days: +1}, $set:{used: true, date: timeStamp}})
        return pointsEarned
      }else if(currentDaysAdded >= twoStreak){
        //console.log('two streak')
        Streak.update(streak, {$set:{date: timeStamp}})
      }
    },
    chestSelect: function(bookId, item, callback){
      var timeStamp = new Date();
      var itemNum = parseInt(item);
      var chestPull = Books.findOne({_id:bookId, owner: Meteor.userId()})
      var itemName;
      // var bookPull = Books.findOne({bookNum: chestsArray[chestNum][0], owner: Meteor.userId()})
      // var bookPullTwo = Books.findOne({bookNum: chestsArray[chestNum][1], owner: Meteor.userId()})
      if(chestPull.totalComplete){
        if(chestPull.spent){
          return true
        }else{
          //Chest items
          //var itemNum = parseInt(item)
          //var keysNeeded = Chests.findOne({chest:chestNum, owner: Meteor.userId()}).keysNeeded
          var chestItemsPull = ChestItems.findOne({owner: Meteor.userId()});
          var points = Points.findOne({owner: Meteor.userId()})
          switch (itemNum)
          {
          case 1:
            var itemExists = ChestItems.findOne({owner:Meteor.userId(), item:itemNum})
            if(itemExists){
              ChestItems.update(itemExists, {$inc:{doubler:20}});
            }else{
              ChestItems.insert({owner: Meteor.userId(), item: itemNum, doubler:20});
            }
            Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, doubler:true, date:timeStamp.toISOString()})
            itemName = 'Doubler'
            break;
          case 2:
            Points.update(points, {$inc: {total: 500}})
            //ChestItems.insert({owner: Meteor.userId(), item: itemNum, instantCoins:500});
            Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, instantCoins:500, date:timeStamp.toISOString()})
            itemName = '500 coins'
            break;
          case 3:
            Points.update(points, {$inc: {total: 1000}})
            //ChestItems.insert({owner: Meteor.userId(), item: itemNum, instantCoins:1000});
            Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, instantCoins:1000, date:timeStamp.toISOString()})
            itemName = '1000 coins'
            break;
          case 4:
            var itemExists = ChestItems.findOne({owner:Meteor.userId(), item:itemNum})
            if(itemExists){
              ChestItems.update(itemExists, {$inc:{recycler:5}});
            }else{
              ChestItems.insert({owner: Meteor.userId(), item: itemNum, recycler:5});
            }
            Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, recycler:true, date:timeStamp.toISOString()})
            itemName = 'Recycler'
            break;
          case 5:
            Points.update(points, {$inc: {stars: +1}})
            Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, instantStars:1, date:timeStamp.toISOString()})
            itemName = '1 star'
            // ChestItems.insert({owner: Meteor.userId(), item: itemNum, lifeUpgrade:1});
            // var questions = Questions.find({owner: Meteor.userId(), lives: 3, complete:false}).fetch()
            // _.each(questions, function(doc){
            //     Questions.update(doc, {$set:{lives:4}})
            // })
            // Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, lifeUpgrade:true, date:timeStamp.toISOString()})
            break;
          case 6:
            Points.update(points, {$inc: {stars: +3}})
            Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, instantStars:3, date:timeStamp.toISOString()})
            itemName = '3 stars'
            // ChestItems.insert({owner: Meteor.userId(), item: itemNum, unlimitedAudio:1});
            // Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, unlimitedAudio:true, date:timeStamp.toISOString()})
            break;
          case 7:
            Points.update(points, {$inc: {stars: +5}})
            Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, instantStars:5, date:timeStamp.toISOString()})
            itemName = '5 stars'
            // ChestItems.insert({owner: Meteor.userId(), item: itemNum, questionView:1});
            // Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, questionView:true, date:timeStamp.toISOString()})
            break;
          } 
          //Points.update(points, {$inc: {keys: -keysNeeded}})
          Books.update(chestPull, {$set:{item:itemNum, spent:true}})
          return itemName
        }
      }
    },
    unlockBook: function(bookName, callback){
      var bookToUnlock = Books.findOne({owner: Meteor.userId(), bookName:bookName})
      var book = Books.findOne({owner: Meteor.userId(), bookNum:bookToUnlock.bookNum -1})
      var stars = book.chapters - book.chaptersTotalComplete
      var starsAvailable = Points.findOne({owner: Meteor.userId()})
      if(starsAvailable.stars >= stars){
        Points.update(starsAvailable, {$inc: {stars: -stars}})
        Books.update(bookToUnlock, {$set:{unlocked: true}})
        return 'unlocked'
      }else{
        return 'error'
      }
    },
    emailWaitingList: function(email, html, callback){
      var validEmail = validateEmail(email)
      if(validEmail){

        
        if(EmailList.findOne({ email: email })){
          return false
        }else{
          var currentdate = new Date()
          EmailList.insert({
            email:email,
            date: currentdate
          })
          Email.send({
            to: email,
            from: 'Verses <no-reply@joinverses.com>',
            subject: 'Verses coming soon',
            html: html
          });
        }
        
      }
    },
    followUser: function(user){
      var timeStamp = new Date();
      var following = Following.findOne({owner: Meteor.userId()})
      var userExists = Following.findOne({owner: Meteor.userId(), following:user})
      var activity = Activity.findOne({owner: Meteor.userId(), activityFollowing:user})
      var activityFollower = Following.findOne({owner: user, following:Meteor.userId()})
      if(!userExists){
          //console.log('if')
        Following.insert({following: user, date:timeStamp.toISOString(), owner: Meteor.userId()});
        if(!activity){
          if(activityFollower){
            //console.log('They are following you')
            Activity.update(activityFollower, {$set:{bothFollow:true, date:timeStamp.toISOString()}})
            Activity.insert({owner: Meteor.userId(), like: [], activityFollowing:user, bothFollow:true, date:timeStamp.toISOString()})
          }else{
            Activity.insert({owner: user, like: [], activityFollowing:Meteor.userId(), followedBy:true, date:timeStamp.toISOString()})
            Activity.insert({owner: Meteor.userId(), like: [], activityFollowing:user, date:timeStamp.toISOString()})
          }
          
        }
      }else{
        Following.remove({_id: userExists._id});
      }

      var followers = Followers.findOne({owner: user})
      var followersUserExists = Followers.findOne({owner: user, followers:Meteor.userId()})
      if(!followersUserExists){
          //console.log('if')
          Followers.insert({followers: Meteor.userId(), owner: user});
      }else{
        //console.log(followersUserExists)
        Followers.remove({_id: followersUserExists._id});
      }
    },
    publicPercent: function(usersID, callback){
      return Meteor.users.findOne({'_id':usersID}, {fields: {'profile.progressPercent': 1}}).profile.progressPercent
    },
    donateCharge: function(stripeToken, amount){
      // Set your secret key: remember to change this to your live secret key in production
      // See your keys here https://manage.stripe.com/account
      //stripe.setApiKey("sk_test_5KJpKpEsHy0Gemfg4DD33m2B");
      // (Assuming you're using express - expressjs.com)
      // Get the credit card details submitted by the form
      //var stripeToken = request.body.stripeToken;
      //console.log(amount)
      
      var amountNum = parseInt(amount)

      if(Meteor.userId()){
        
        var user = Meteor.users.findOne({'_id':Meteor.userId()})

        if(Donations.findOne({owner: Meteor.userId()})){
          var fut = new Future();
          //CHARGE EXISTING CUSTOMER
          var donate = Donations.findOne({owner: Meteor.userId()})

          Donations.update(donate, {$inc: {amount: amountNum}});

          Stripe.charges.create({
            amount: amountNum, // amount in cents, again
            currency: "cad",
            customer: donate.custId,
            description: 'Donation to Verses Inc.'
          }, function(err, charge) {
            if(err){
              var result = ['err', err]
            }else{
              var result = ['chargeAnon', charge]
            }
            fut['return'](result);
          });
          var result = fut.wait();
          return result
          
        }else{
          var fut = new Future();
          //CREATE THE CUSTOMER
          Stripe.customers.create({
            card: stripeToken,
            email: user.profile.email
          }, function(err, customer) {
            if(err){console.log(err)}
            //console.log(customer.id)
            //fut.ret(customer);
            fut['return'](customer);
          });
          var customer = fut.wait();
          //var customer = fut['wait'];
          //console.log('Customer: '+customer)
          Donations.insert({amount: amountNum, custId: customer.id, custCard: customer.default_card, owner: user._id});

          var fut = new Future();
          Stripe.charges.create({
            amount: amountNum, // amount in cents, again
            currency: "cad",
            customer: customer.id,
            description: 'Donation to Verses Inc.'
          }, function(err, charge) {
            if(err){
              var result = ['err', err]
            }else{
              var result = ['charge', charge]
            }
            fut['return'](result);
          });
          var result = fut.wait();
          return result
        }
      }else{
        var fut = new Future();
        // ANONYMOUS CHARGE
        Stripe.charges.create({
            amount: amountNum, // amount in cents, again
            currency: "cad",
            card: stripeToken,
            description: 'Anonymous donation to Verses Inc.'
          }, function(err, charge) {
            //fut.ret(err);
            //console.log(err)
            if(err){
              var result = ['err', err]
            }else{
              var result = ['chargeAnon', charge]
            }
            fut['return'](result);
          });
        var result = fut.wait();
        return result
      }
    },
    donateChargeExisting: function(amount, callback){
      var fut = new Future();
      var user = Meteor.users.findOne({'_id':Meteor.userId()})
      var donate = Donations.findOne({owner: Meteor.userId()})
      var custId = donate.custId
      var amountNum = parseInt(amount)

      Stripe.charges.create({
        amount: amountNum, // amount in cents, again
        currency: "cad",
        customer: custId,
        description: 'Donation to Verses Inc.'
      }, function(err, charge) {
        if(err){
          var result = ['err', err]
        }else{
          var result = ['charge', charge]
        }
        fut['return'](result);
        
      });
      var result = fut.wait();
      if(result[0] == 'err'){
        return result
      }else{
        Donations.update(donate, {$inc: {amount: amountNum}});
        return result
      }
    },
    pullCustomer: function(callback){
      var custId = Donations.findOne({owner: Meteor.userId()}).custId
      var fut = new Future();
      Stripe.customers.retrieve(custId, function(err, customer) {
        //fut.ret(customer);
        fut['return'](customer);
      });
      var customer = fut.wait();
      //var customer = fut['wait'];
      //console.log('Customer: '+customer)
      return customer
    },
    listCharges: function(callback){
        var custId = Donations.findOne({owner: Meteor.userId()}).custId
        var fut = new Future();
        Stripe.charges.list({ 
          customer: custId,
          count: 100
        }, function(err, charges) {
          //fut.ret(charges);
          fut['return'](charges);
        });
        var charges = fut.wait();
        //var customer = fut['wait'];
        //console.log('Charge: '+charges)
        return charges
    },
    displayCharge: function(chargeId, callback){
        var custId = Donations.findOne({owner: Meteor.userId()}).custId
        var fut = new Future();
        Stripe.charges.retrieve( chargeId, function(err, charge) { 
          fut['return'](charge)
        });
        var charge = fut.wait();
        if(charge){
          if(custId == charge.customer){
            return charge
          }else{
            return 'invalid'
          }
        }else{
          return 'invalid'
        }
    },
    createCard: function(token, callback){
      var custId = Donations.findOne({owner: Meteor.userId()}).custId
      var fut = new Future();
      Stripe.customers.createCard(custId,{card: token}, function(err, card) {
        //fut.ret(card);
        fut['return'](card);
      });
      var card = fut.wait();
      return card
    },
    updateDefaultCard: function(card, callback){
      var donate = Donations.findOne({owner: Meteor.userId()})
      var custId = donate.custId
      var fut = new Future();
      Stripe.customers.update(custId,{default_card: card}, function(err, customer) {
        //fut.ret(customer);
        fut['return'](customer);
      });
      var customer = fut.wait();
      Donations.update(donate, {$set: {custCard: card}});
      return customer
    },

    sendEmail: function (to, from, subject, text) {
      if(Meteor.isServer) {
        //check([to, from, subject, text], [String]);

        // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        // this.unblock();

        // Email.send({
        //   to: to,
        //   from: from,
        //   subject: subject,
        //   text: text
        // });
      }
    },
    sendVerification: function (userId) {
      userId = String(userId)
      Accounts.sendVerificationEmail(userId)
    },


    getAudioPath: function (){
      var result = Meteor.http.get("http://dbt.io/audio/location?protocol=http&v=2&key="+dbt_key).data
      return result[0];
    },
    ajaxAudio: function (bookId, chapterNum){
      var fut = new Future();
      Meteor.call('getAudioPath', function (error, result){
        var pathUrl = 'http://dbt.io/audio/path?dam_id=' + dam_audio_id + '&book_id=' + bookId + '&chapter_id=' + chapterNum + '&v=2' + '&key=' + dbt_key
        var audio = Meteor.http.get(pathUrl).data
        var fullPath = result.protocol + "://" + result.server + result.root_path + "/" + audio[0].path;
        
        fut['return'](fullPath);
      })
      var fullPath = fut.wait();
      return fullPath
    },
    ajaxText: function (bookId, chapterNum){
      var fut = new Future();
      Meteor.call('getAudioPath', function (error, result){
        var pathUrl = 'http://dbt.io/text/verse?dam_id=' + dam_text_id + '&book_id=' + bookId + '&chapter_id=' + chapterNum + '&v=2' + '&key=' + dbt_key
        var text = Meteor.http.get(pathUrl).data
        var fullPath = result.protocol + "://" + result.server + result.root_path + "/" + text[0].path;
        
        fut['return'](text);
      })
      var text = fut.wait();
      return text
    },
    searchUser: function(searchVal, callback){
      var trimmedVal = searchVal.replace(/[*|&;$%@"<>()+,]/gi, '')
      var query = { username: new RegExp(trimmedVal,"i") }
      var userNameResult = Meteor.users.find(query).fetch()
      if(userNameResult.length){
        return userNameResult
      }else{
        query = { 'profile.name': new RegExp(trimmedVal,"i") }
        return Meteor.users.find(query).fetch()
      }
      
    },
    confirmCoins:function(callback){
      var points = Points.findOne({owner: Meteor.userId()})
      if(points.stars >= 5){
        var date = new Date();
        Points.update(points, {$inc: {stars: -5, total: 500}});

        if(Activity.findOne({owner:Meteor.userId(), instantCoins: { $exists: true}})){
            var recentActivity = Activity.findOne({owner:Meteor.userId(), instantCoins: { $exists: true}},{sort: {date: -1}, limit: 10})
            var timeStamp = new Date().getTime();
            var recentConvert = new Date(recentActivity.date).getTime()
            var difference = parseInt(timeStamp-recentConvert)
        }

        if(recentActivity){
          if(difference > 900000){
            Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, instantCoins:500, date:date.toISOString()})
          }else{
            Activity.update(recentActivity, {$inc:{instantCoins:500}, $set:{date:date.toISOString()}})
        }}else{
          Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, instantCoins:500, date:date.toISOString()})
        }
        return true
      }
    },
    confirmRevive:function(callback){
      var points = Points.findOne({owner: Meteor.userId()})
      if(points.stars >= 15){
        var timeStamp = new Date();
        Points.update(points, {$inc: {stars: -15}});
        var itemExists = ChestItems.findOne({owner:Meteor.userId(), item:4})
        if(itemExists){
          ChestItems.update(itemExists, {$inc:{recycler:5}});
        }else{
          ChestItems.insert({owner: Meteor.userId(), item: 4, recycler:5});
        }
        
        Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, recycler:true, date:timeStamp.toISOString()})
        return true
      }
    },
    confirmLifeUpgrade:function(callback){
      var points = Points.findOne({owner: Meteor.userId()})
      var itemExists = ChestItems.findOne({owner:Meteor.userId(), item:8})
      if(points.stars >= 25 && !itemExists){
        var timeStamp = new Date();
        Points.update(points, {$inc: {stars: -25}});
        ChestItems.insert({owner: Meteor.userId(), item: 8, lifeUpgrade:1});
        var questions = Questions.find({owner: Meteor.userId(), lives: 2, complete:false}).fetch()
        _.each(questions, function(doc){
            Questions.update(doc, {$set:{lives:3}})
        })
        Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, lifeUpgrade:true, date:timeStamp.toISOString()})
        return true
      }
    },
    confirmShowQuestions:function(callback){
      var points = Points.findOne({owner: Meteor.userId()})
      if(points.stars >= 50){
        var timeStamp = new Date();
        Points.update(points, {$inc: {stars: -50}});
        ChestItems.insert({owner: Meteor.userId(), item: 9, questionView:1});
        Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, questionView:true, date:timeStamp.toISOString()})
        return true
      }
    },
    confirmUnlimited:function(callback){
      var points = Points.findOne({owner: Meteor.userId()})
      if(points.stars >= 75){
        var timeStamp = new Date();
        Points.update(points, {$inc: {stars: -75}});
        ChestItems.insert({owner: Meteor.userId(), item: 10, unlimitedAudio:1});
        Activity.insert({owner: Meteor.userId(), like: [], chestItem:true, unlimitedAudio:true, date:timeStamp.toISOString()})
        return true
      }
    },
    newTestamentComplete: function(){
      if(Books.find({owner: Meteor.userId(), totalComplete:true}).count() == 27){
        var timeStamp = new Date();
        Activity.insert({owner: Meteor.userId(), like: [], finished:1, date:timeStamp.toISOString()})
        Meteor.users.update({_id:Meteor.user()._id}, {$inc:{'profile.finished': +1}, $set:{'profile.finishedDate':timeStamp.toISOString()}})
      }
    }
  })


  Meteor.publish('points_db', function(){
      return Points.find({owner: this.userId});
  });
  Meteor.publish('notification_db', function(){
      return Notification.find({owner: this.userId});
  });
  Meteor.publish('chapters_db', function(){
      return Chapters.find({owner: this.userId});
  });
  Meteor.publish('questions_db', function(){
      return Questions.find({owner: this.userId});
  });
  Meteor.publish('books_db', function(){
      return Books.find({owner: this.userId});
  });
  Meteor.publish('streak_db', function(){
      return Streak.find({owner: this.userId});
  });
  Meteor.publish('gifts_db', function(){
      return Gifts.find({owner: this.userId});
  });
  Meteor.publish('chests_db', function(){
      return Chests.find({owner: this.userId});
  });
  Meteor.publish('chestItems_db', function(){
      return ChestItems.find({owner: this.userId});
  });
  Meteor.publish('following_db', function(){
      return Following.find({owner: this.userId});
  });
  Meteor.publish('followers_db', function(){
      return Followers.find({owner: this.userId});
  });
  Meteor.publish('activity_db', function(){
      return Activity.find({owner: this.userId});
  });
  Meteor.publish('progress_db', function() {
      if(!this.userId) return null;
      var user = Meteor.users.findOne(this.userId);
      if(user.profile.admin) return Progress.find({});
      return null;
  });
  Meteor.publish('emailList_db', function(){
      if(!this.userId) return null;
      var user = Meteor.users.findOne(this.userId);
      if(user.profile.admin) return EmailList.find();
      return null;
  });
  Meteor.publish("userdata", function () {
      if(!this.userId) return null;
      var user = Meteor.users.findOne(this.userId);
      if(user.profile.admin){
        return Meteor.users.find({});
      }else{
        return Meteor.users.find({_id: user._id})
      }
      return null;
  });
  Meteor.publish("publicfollowing", function (user) {
      return Following.find({ owner: user });
  });
  Meteor.publish("publicfollowers", function (user) {
      return Followers.find({ owner: user });
  });
  Meteor.publish("publicdata", function (username) {
      var publicUser = Meteor.users.findOne({'username':username})
      //console.log(publicUser.username)
      return Meteor.users.find({_id: publicUser._id},
                           {fields: {'profile.name':1, 'username': 1, 'profile.avatar': 1}});
  });
  Meteor.publish("followdata", function (users) {
      var userList = Meteor.users.find({ _id: { $in: users } },{fields: {'profile.name':1, 'username': 1, 'profile.avatar': 1, 'profile.progress':1}})
      return userList
  });
  Meteor.publish("activitydata", function (id) {
    return Meteor.users.find({_id: id},{fields: {'profile.name':1, 'username': 1, 'profile.avatar': 1}})
    //console.log(Meteor.users.findOne({_id: id}))
  });
  Meteor.publish("likedata", function (id) {
    return Meteor.users.find({_id: {$in: id}},{fields: {'profile.name':1, 'username': 1, 'profile.avatar': 1}})
  });
  Meteor.publish('followpoints', function (users){
    return Points.find({ owner: { $in: users } });
  });
  Meteor.publish('publicpoints', function (user){
    return Points.find({ owner: user });
  });
  Meteor.publish('publicactivity', function (userID){
    return Activity.find({owner: userID});
  });
  Meteor.publish('publicbooks', function (userID){
    return Books.find({owner: userID});
  });
  Meteor.publish('donations_db', function (userID){
    return Donations.find({owner: this.userId});
       
  });


}