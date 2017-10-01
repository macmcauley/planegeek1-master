var express = require("express");
var router  = express.Router();
var Plane = require("../models/plane");
var middleware = require("../middleware");


//INDEX - show all planes
router.get("/", function(req, res){
    // Get all planes from DB
    Plane.find({}, function(err, allPlanes){
       if(err){
           console.log(err);
       } else {
          res.render("planes/index",{planes:allPlanes});
       }
    });
});

//CREATE - add new plane to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to planes array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newPlane = {name: name, price: price, image: image, description: desc, author:author};
    // Create a new plane and save to DB
    Plane.create(newPlane, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to planes page
            console.log(newlyCreated);
            res.redirect("/planes");
        }
    });
});

//NEW - show form to create new plane
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("planes/new"); 
});

// SHOW - shows more info about one plane
router.get("/:id", function(req, res){
    //find the plane with provided ID
    Plane.findById(req.params.id).populate("comments").exec(function(err, foundPlane){
        if(err || !foundPlane){
            req.flash("error", "plane not found");
            res.redirect("back");
        } else {
            console.log(foundPlane)
            //render show template with that plane
            res.render("planes/show", {plane: foundPlane});
        }
    });
});

// EDIT PLANE ROUTE
router.get("/:id/edit", middleware.checkPlaneOwnership, function(req, res){
    Plane.findById(req.params.id, function(err, foundPlane){
        res.render("planes/edit", {plane: foundPlane});
    });
});

// UPDATE PLANE ROUTE
router.put("/:id",middleware.checkPlaneOwnership, function(req, res){
    // find and update the correct plane
    Plane.findByIdAndUpdate(req.params.id, req.body.plane, function(err, updatedPlane){
       if(err){
           res.redirect("/planes");
       } else {
           //redirect somewhere(show page)
           res.redirect("/planes/" + req.params.id);
       }
    });
});

// DESTROY PLANE ROUTE
router.delete("/:id",middleware.checkPlaneOwnership, function(req, res){
   Plane.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/planes");
      } else {
          res.redirect("/planes");
      }
   });
});


module.exports = router;