
Books = new Meteor.Collection("books");
Streak = new Meteor.Collection("streaks");
Points = new Meteor.Collection("points");
Notification = new Meteor.Collection("notification");
Chapters = new Meteor.Collection("chapters");
Questions = new Meteor.Collection("questions");
Gifts = new Meteor.Collection("gifts");
Chests = new Meteor.Collection("chests");
ChestItems = new Meteor.Collection("chestItems");
Progress = new Meteor.Collection("progress");
EmailList = new Meteor.Collection("emailList");
Following = new Meteor.Collection("following");
Followers = new Meteor.Collection("followers");
Donations = new Meteor.Collection("donations");
Activity = new Meteor.Collection("activity");

bookNames = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']
var chestTmpls = [[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6],[1,3,6]]
var chapterVerses = [[],
[,25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
[,45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20], 
[,80, 52, 38, 44, 39, 49, 59, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53], 
[,51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25], 
[,26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 28, 40, 30, 35, 27, 27, 32, 44, 31], 
[,32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27], 
[,31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24], 
[,24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14], 
[,24, 21, 29, 31, 26, 18], 
[,23, 22, 21, 32, 33, 24], 
[,30, 30, 21, 23], 
[,29, 23, 25, 28],
[,10, 20, 13, 18, 28],
[,12, 17, 18],
[,20, 15, 16, 16, 25, 21],
[,18, 26, 17, 22],
[,16, 15, 15],
[,25],
[,14, 18, 19, 16, 14, 20, 28, 13, 28, 29, 40, 29, 25],
[,27, 26, 18, 17, 20],
[,25, 25, 22, 19, 14],
[,21, 22, 18],
[,10, 29, 24, 21, 21],
[,13],
[,15],
[,25],
[,20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]]
monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
giftsArray = [[0,1],[3,4],[7,8],[10,11],[13,14],[15,16],[18,19],[21,22],[24,25]]
chestsArray = [[0,0],[2,3],[3,4],[5,6],[8,9],[11,12],[13,14],[17,18],[20,21],[21,22],[23,24]]
var giftsCoin = [750,1000,500,300,300,300,500,300,200]

// Books.allow({
//   remove: function(userId, doc){
//     return true
//   },
//   update: function(userId, doc){
//     return true
//   },
//   insert: function(userId, doc){
//     return true
//   }
// })

// Points.allow({
//   remove: function(userId, doc){
//     return true
//   },
//   update: function(userId, doc){
//     return true
//   },
//   insert: function(userId, doc){
//     return true
//   }
// })

// Chapters.allow({
//   remove: function(){
//     return true
//   },
//   update: function(){
//     return true
//   },
//   insert: function(){
//     return true
//   }
// })


Meteor.methods({
  

  checkPoints: function () {
  	if(Points.find({owner: Meteor.userId()}).count() == 0){
      var userId = Meteor.userId();
      Meteor.call('initialPoints', userId)
    }
  },

  initialStreak: function(offset){
    if(!Streak.findOne({owner: Meteor.userId()})){
      var date = new Date();
      var timeStamp = new Date(date.getTime() - offset);
      Streak.insert({
        days: 0,
        used: false,
        date: timeStamp,
        owner: Meteor.userId()
      })
    }else{
      Meteor.call('checkStreak', offset)
    }
  },

  checkAudio: function (bookName, chapter){
    var chapter = Chapters.findOne({chapter: chapter, bookName: bookName, owner: Meteor.userId()});
    if(ChestItems.findOne({owner: Meteor.userId(), unlimitedAudio:{"$exists":true}}) || chapter.coinsAccumulated < chapter.verses){
      return true
    }
    
  },

  audioPoints: function (bookName, chapter) {
    var point = Points.findOne({owner: Meteor.userId()});
    var book = Books.findOne({owner: Meteor.userId(), bookName: bookName});
    var chapter = Chapters.findOne({chapter: chapter, bookName: bookName, owner: Meteor.userId()});
    var timeStamp = new Date();

    if(ChestItems.findOne({owner: Meteor.userId(), unlimitedAudio:{"$exists":true}})){
      Points.update(point, {$inc: {total: 1}});
      Books.update(book, {$inc: {bookCoinsEarned: 1}})
      Chapters.update(chapter, {$inc: {coinsAccumulated: 1}});
      Meteor.call('activityPoints', 1, "audio", timeStamp, bookName, chapter, 0)
    }else{
      if(chapter.coinsAccumulated < chapter.verses){
        Points.update(point, {$inc: {total: 1}});
        Books.update(book, {$inc: {bookCoinsEarned: 1}})
        Chapters.update(chapter, {$inc: {coinsAccumulated: 1}});
        Meteor.call('activityPoints', 1, "audio", timeStamp, bookName, chapter, 0)
      }
    }
  },

  activityPoints: function (amount, type, date, bookName, chapter, completedChapter){
    if(Activity.findOne({point:Meteor.userId(), bookName: bookName})){
      var recentActivity = Activity.findOne({point:Meteor.userId(), bookName: bookName},{sort: {date: -1}, limit: 10})
      var timeStamp = new Date().getTime();
      var recentConvert = new Date(recentActivity.date).getTime()
      var difference = parseInt(timeStamp-recentConvert)
    }
    
    if(recentActivity){
      if(difference > 43200000){
        if(type == 'chapterComplete'){
          Activity.insert({owner: Meteor.userId(), like: [], amount: amount, completedChapter: [completedChapter], chapter: chapter, bookName: bookName, point:Meteor.userId(), date:date.toISOString()})
        }else{
          Activity.insert({owner: Meteor.userId(), like: [], amount: amount, completedChapter: [], chapter: chapter, bookName: bookName, point:Meteor.userId(), date:date.toISOString()})
        }
      }else{
        if(recentActivity.bookName == bookName){
          if(type == 'chapterComplete'){
            Activity.update(recentActivity, {$inc: {amount: +amount},$addToSet:{completedChapter:completedChapter}, $set:{date:date.toISOString()}})
          }else{
            Activity.update(recentActivity, {$inc: {amount: +amount}, $set:{date:date.toISOString()}})
          }
        }
      }
    }else{
      if(type == 'chapterComplete'){
        Activity.insert({owner: Meteor.userId(), like: [], amount: amount, completedChapter: [completedChapter], chapter: chapter, bookName: bookName, point:Meteor.userId(), date:date.toISOString()})
      }else{
        Activity.insert({owner: Meteor.userId(), like: [], amount: amount, completedChapter: [], chapter: chapter, bookName: bookName, point:Meteor.userId(), date:date.toISOString()})
      }
    }
  },
  removeNotifications: function(){
    Notification.update({owner: Meteor.userId(), type: 'shop'}, {$set:{seen:true}}, {multi:true})
  },
  likeActivity: function(id){
    var activity = Activity.findOne({_id: id})
    if(!Activity.findOne({_id: id, like:{$in: [Meteor.userId()]}})){
      Activity.update(activity, {$addToSet:{like: Meteor.userId()}})
    }else{
      Activity.update(activity, {$pull:{like: Meteor.userId()}})
    }
  },
  initialPoints: function (userId) {
  	if (!this.userId){
  		//alert('not logged in')
  	}
  	else{
  		return Points.insert({total: 0, stars: 0, shopNotification: 1, owner: userId});
  	}
  },
  wrongAnswer: function(questionPoint){
    if(questionPoint.lives == 3){
      Questions.update(questionPoint, {$inc: {lives: -1}});
    }else{
      Questions.update(questionPoint, {$inc: {pointsRemaining: -15, lives: -1}});
    }
    
  },
  wrongAnswerEnd: function(questionPoint){
    Questions.update(questionPoint, {$inc: {pointsRemaining: -15, lives: -1}, $set:{allIncorrect:true}});
  },
  correctAnswer: function(chapterCorrect){
    Chapters.update(chapterCorrect, {$inc: {correctAnswers:+1}})
  },
  completeChapter: function(chapterCorrect){
    Chapters.update(chapterCorrect, {$set: {totalComplete:true}})
  },
  progressInc: function(chapterPush){
    // var percent = Meteor.users.findOne({_id:Meteor.user()._id}).profile.progressPercent
    var progress = Meteor.users.findOne({_id:Meteor.user()._id}).profile.progress
    if(chapterPush){
      Meteor.users.update({_id:Meteor.user()._id}, {$inc:{'profile.completedChapters':+1}})
    }
    
    var completedChapters = Meteor.users.findOne({_id:Meteor.user()._id}).profile.completedChapters
    var percentUpdate = Math.floor((completedChapters * 100)/260)
    Meteor.users.update({_id:Meteor.user()._id}, {$inc:{'profile.progress':+1}, $set:{'profile.progressPercent':percentUpdate}})
    var currentdate = new Date()
    var month = (currentdate.getMonth()+1)
    if(month < 10){
      var month = parseInt("0"+month)
    }
    var day = currentdate.getDate()
    if(day < 10){
      var day = parseInt("0"+day)
    }
    var thisDate = parseInt(currentdate.getFullYear() +""+ month +""+ day)
    //console.log(thisDate)
    if(Progress.findOne({"date": thisDate})){
      var progID = Progress.findOne({"date":thisDate})._id
      Progress.update({_id: progID}, {$inc:{progress: +1}})
    }else{
      Progress.insert({"date": thisDate, progress: 1, month: month, day: day})
    }
  },
  unlockGift: function(giftIndex){
    var giftUnlock = Gifts.findOne({gift:giftIndex, owner: Meteor.userId()})
    Gifts.update(giftUnlock, {$set:{unlocked:true}})
  },
  unlockChest: function(chestIndex){
    var chestUnlock = Chests.findOne({chest:chestIndex, owner: Meteor.userId()})
    Chests.update(chestUnlock, {$set:{unlocked:true}})
  },
  removePoints: function (pointsId) {
  	return Points.remove({_id: pointsId});
  },
  chapterInitialize: function(bookName){
    if(bookNames.indexOf(bookName) != -1){
      var book = Books.findOne({bookName: bookName, owner: Meteor.userId()})
      var chapters = book.chapters
      var bookNum = book.bookNum + 1
      if(Chapters.find({bookName: bookName, owner: Meteor.userId()}).count() == 0){
        for (var i=1; i<=chapters; i++){
          Chapters.insert({
            bookName: bookName,
            chapter: i,
            verses: chapterVerses[bookNum][i],
            complete: false,
            totalComplete: false,
            coinsAccumulated: 0,
            correctAnswers:0,
            owner: Meteor.userId()
          })
        }
      }
    }
    
  },
  audioComplete: function(chapter, versesCount, bookName, callback){
    var addToBookCompletion = Books.findOne({bookName: bookName, owner: Meteor.userId()});
    var chaptersLessOne = parseInt(addToBookCompletion.chapters)-1
    var chapter = Chapters.findOne({chapter: chapter, bookName: bookName, owner: Meteor.userId()})
    var pointAdd = parseInt(versesCount)
    Chapters.update(chapter, {$set: {complete: true}})
    if(addToBookCompletion.chaptersComplete == chaptersLessOne){
      Books.update(addToBookCompletion, {$inc: {chaptersComplete:+1}, $set: {complete:true}})
      Meteor.call('progressInc')
  
    }else if(addToBookCompletion.chaptersComplete < chaptersLessOne){
      Books.update(addToBookCompletion, {$inc: {chaptersComplete:+1}})
      Meteor.call('progressInc')
    }
    return true
    //Meteor.call('addPoints', pointAdd)
  },
  questionsInitialize: function(chapter, bookName){
    if(Questions.find({bookName: bookName, chapter: chapter, owner: Meteor.userId()}).count() == 0){
      var lives = 2
      if(ChestItems.findOne({owner: Meteor.userId(), lifeUpgrade:{"$exists":true}})){
        lives = 3
      }
      for (var i=1; i<=3; i++){
        Questions.insert({
          bookName: bookName,
          chapter: chapter,
          question: i,
          answer: 0,
          pointsAquired: 0,
          pointsRemaining: 30,
          lives: lives,
          complete: false,
          allIncorrect: false,
          owner: Meteor.userId()
        })
      }
    }
  },
  
  recycleQuestion: function(questionId, bookName, special, callback){
    var questionRecycle = Questions.findOne({_id: questionId, owner: Meteor.userId()});
    var totalPoints = Points.findOne({owner: Meteor.userId()})
    var lives = 2
    if(ChestItems.findOne({owner: Meteor.userId(), lifeUpgrade:{"$exists":true}})){
      lives = 3
    }
    if(special && questionRecycle.allIncorrect){

      if(ChestItems.findOne({owner: Meteor.userId(), recycler:{"$exists":true}})){
        var recycler = ChestItems.findOne({owner: Meteor.userId(), recycler:{"$exists":true}})
        if(recycler.recycler > 1){
          Questions.update(questionRecycle, {$set: {pointsRemaining: 30, lives: lives, allIncorrect: false}})
          ChestItems.update(recycler, {$inc:{recycler:-1}})
        }else{
          Questions.update(questionRecycle, {$set: {pointsRemaining: 30, lives: lives, allIncorrect: false}})
          ChestItems.remove(recycler)
        }
        
      }
    }else{
      if(totalPoints.total >= 100 && questionRecycle.allIncorrect){
        Questions.update(questionRecycle, {$set: {pointsRemaining: 30, lives: lives, allIncorrect: false}})
        //Meteor.call('addPoints', -100, bookName)
        var point = Points.findOne({owner: Meteor.userId()});
        var book = Books.findOne({owner: Meteor.userId(), bookName: bookName});
        Points.update(point, {$inc: {total: -100}});
        Books.update(book, {$inc: {bookCoinsEarned: -100}})
      }else if(totalPoints.total < 100){
        return 'noPoints'
      }
    }
    
  },
  updateUserAvatar: function(imagePath){
    Meteor.users.update({_id:Meteor.user()._id}, {$set:{'profile.avatar':imagePath}})
  },
  checkGift: function(gift, callback){
    var giftNum = parseInt(gift);
    var bookPull = Books.findOne({bookNum: giftsArray[giftNum][0], owner: Meteor.userId()})
    var bookPullTwo = Books.findOne({bookNum: giftsArray[giftNum][1], owner: Meteor.userId()})
    var giftPull = Gifts.findOne({gift:giftNum, owner: Meteor.userId()})
    if(bookPull.totalComplete || bookPullTwo.totalComplete){
      if(giftPull.spent != true){
        //Meteor.call('addPoints', giftPull.giftsCoin)
        var point = Points.findOne({owner: Meteor.userId()});
        Points.update(point, {$inc: {total: giftPull.giftsCoin}});
        Gifts.update(giftPull, {$set:{spent: true}})
        return [giftNum,giftPull.giftsCoin,false]
      }else{
        return [giftNum,giftPull.giftsCoin,true]
      }
      
      
    }else{
      return false
    }
  }
})
