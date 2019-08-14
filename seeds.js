const mongoose = require('mongoose');
const Campground = require('./models/campgrounds');
const Comment = require('./models/comment');

let data = [
    {
        name: 'Cloud\'s Rest',
        image: 'https://farm9.staticflickr.com/8041/7930201874_6c17ed670a.jpg',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit'
    },

    {
        name: 'Desert Mesa',
        image: 'https://farm1.staticflickr.com/130/321487195_ff34bde2f5.jpg',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit'
    },

    {
        name: 'Canyon Floor',
        image: 'https://farm8.staticflickr.com/7338/9627572189_12dbd88ebe.jpg',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit'
    }
];

function seedDB() {
    // remove all campgrounds
    Campground.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('removed campgrounds!');
            // add a few campgrounds
            data.forEach(seeds => {
                Campground.create(seeds, (err, campground) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('added a campground');
                        // add a few comments
                        Comment.create({
                            text: 'This place is great but, I wish there was internet',
                            author: 'Homer'
                        }, (err, comment) => {
                            if (err) {
                                console.log(err);
                            } else {
                                campground.comments.push(comment);
                                campground.save();
                                console.log('Created new comment');
                            }
                        })
                    }
                });
            });
        }
    });
}

module.exports = seedDB;