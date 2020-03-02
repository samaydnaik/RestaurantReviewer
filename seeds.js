var mongoose = require("mongoose")
var Blog = require("./models/blogs"),
Comment = require("./models/comment"),
data = [
    {
        title:"France",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSIe6Xu8hGwEmaP4fb3HKwCSPFZhUF-9uTHwx6_pu6YDmjMboON",
        body:"Not of France"
    },{
        title: "India",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTbWts0RTdJiP2p_Vv59V6x7LcvtG5wFC-LfXY8HKA0BgyrtVzx",
            body: "Not of India"
    },{
        title: "Italy",
            image: "https://images.livemint.com/img/2019/09/23/600x338/hotels-kZnG--621x414@LiveMint_1569216860852.jpg",
            body: "Not of Italy"
    }
]

function seedDB(){

    Blog.remove({}, function (err) {
        if (err) {
            console.log(err)
        }
        console.log("removed hotels")
        data.forEach(function (seed) {
            Blog.create(seed, function (err, hotel) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("added a hotel")

                }
            })
        })
    })

    
}

module.exports = seedDB