const Comment = require('./models/Comment');
const Campground = require('./models/Campground');

const data = [
  {
    name: "Cloud's Rest",
    image:
      'https://res.cloudinary.com/learnhowtocode/image/upload/v1571104211/ih2inp04yrbimbqf4hyg.jpg',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit',
    price: 15,
    author: {
      id: '5fc4eeadccbb8a30bc4985f3',
      username: 'jdoe',
    },
  },

  {
    name: 'Desert Mesa',
    image:
      'https://res.cloudinary.com/learnhowtocode/image/upload/v1607300637/de1ngzlxy5anjlzyuiqn.jpg',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit',
    price: 10,
    author: {
      id: '5fc4efc5ccbb8a30bc4985f4',
      username: 'mdoe',
    },
  },

  {
    name: 'Canyon Floor',
    image:
      'https://res.cloudinary.com/learnhowtocode/image/upload/v1607340065/i8qppdjbzox7qrgx3a6j.jpg',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, eveniet aliquam, deserunt pariatur nesciunt quae possimus consequuntur id tempore adipisci, excepturi reiciendis vitae saepe mollitia! Hic ex quasi ad suscipit',
    price: 13,
    author: {
      id: '5fcd31c40748a00ae49850f4',
      username: 'jennifer',
    },
  },
];

async function seedDB() {
  try {
    // remove all campgrounds
    await Campground.deleteMany();
    console.log('Removed campgrounds!');

    await Comment.deleteMany();
    console.log('Removed comments!');

    data.forEach(async (seeds) => {
      const campground = await Campground.create(seeds);
      console.log('Added a campground...');

      const comment = await Comment.create({
        text: 'This place is great but, I wish there was internet',
        author: 'Homer',
      });

      campground.comments.push(comment);
      await campground.save();
      console.log('Created new comment...');
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = seedDB;
