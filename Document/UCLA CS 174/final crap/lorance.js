
//Maung Maung Phyo Aung
//UID 805183024



window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to 
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused. 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
          gl_Position = projection_camera_transform * model_transform * vec4(object_space_pos, 1.0); 
          position = model_transform * vec4(object_space_pos, 1.0) ;
          center = model_transform * vec4(0, 0, 0, 1.0) ;

        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        { 
          if (distance(position, center) <= 2.5)
          {
            if (sin(28.0 * distance(position, center)) > -0.4)
              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            else
              gl_FragColor = vec4(0.65, 0.4, 0.05, 1.0); 
          }  
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    }
}
window.Equilateral_triangle = window.classes.Equilateral_triangle =
class Equilateral_triangle extends Shape    // The simplest possible Shape – one triangle.  It has 3 vertices, each
{ constructor()                 // having their own 3D position, normal vector, and texture-space coordinate.
    { super( "positions", "normals", "texture_coords" );                       // Name the values we'll define per each vertex.
                                  // First, specify the vertex positions -- the three point locations of an imaginary triangle.
                                  // Next, supply vectors that point away from the triangle face.  They should match up with the points in 
                                  // the above list.  Normal vectors are needed so the graphics engine can know if the shape is pointed at 
                                  // light or not, and color it accordingly.  lastly, put each point somewhere in texture space too.
      this.positions      = [ Vec.of(-1,0,0), Vec.of(1,0,0), Vec.of(0,0,Math.sqrt(3)) ];
      this.normals        = [ Vec.of(0,1,0), Vec.of(0,1,0), Vec.of(0,1,0) ];
      this.texture_coords = [ Vec.of(0,0),   Vec.of(1,0),   Vec.of(0,1)   ]; 
      this.indices        = [ 0, 1, 2 ];                         // Index into our vertices to connect them into a whole triangle.
                 // A position, normal, and texture coord fully describes one "vertex".  What's the "i"th vertex?  Simply the combined data 
                 // you get if you look up index "i" of those lists above -- a position, normal vector, and tex coord together.  Lastly we
                 // told it how to connect vertex entries into triangles.  Every three indices in "this.indices" traces out one triangle.
    }
}

window.Octahedron = window.classes.Octahedron =
class Octahedron extends Shape    // A cube inserts six square strips into its arrays.
{ constructor()  
    { super( "positions", "normals", "texture_coords" );
      
      for( var i = 0; i < 2; i++ )
       for( var j = 0; j<4; j++)                    
        { var Equilateral_triangle_transform =  Mat4.rotation( i == 0 ? 0: Math.PI, Vec.of(1, 0, 0) )
                                                .times(Mat4.rotation( j*Math.PI/2, Vec.of( 0, 1, 0 ) ) )
                                                .times( Mat4.translation([ 0, 0, -1 ]) )
                                                .times(Mat4.rotation( Math.atan(Math.sqrt(2)), Vec.of(-1, 0, 0) ) );
          
          Equilateral_triangle.insert_transformed_copy_into( this, [], Equilateral_triangle_transform );
        }
    }
}



window.Pyramid = window.classes.Pyramid =
class Pyramid extends Shape    // A cube inserts six square strips into its arrays.
{ constructor()  
    { super( "positions", "normals", "texture_coords" );
      
      // for( var i = 0; i < 2; i++ )

       var i =0;
       for( var j = 0; j<4; j++)                    
        { 
          var Equilateral_triangle_transform =  Mat4.rotation( i == 0 ? 0: Math.PI, Vec.of(1, 0, 0) )
                                                .times(Mat4.rotation( j*Math.PI/2, Vec.of( 0, 1, 0 ) ) )
                                                .times( Mat4.translation([ 0, 0, -1 ]) )
                                                .times(Mat4.rotation( Math.atan(Math.sqrt(2)), Vec.of(-1, 0, 0) ) );
          
          Equilateral_triangle.insert_transformed_copy_into( this, [], Equilateral_triangle_transform );
        }
    }
}


window.Assignment_Four_Scene = window.classes.Assignment_Four_Scene =
class Assignment_Four_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,60 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 )  );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform =  Mat4.perspective( Math.PI/4, r, .1, 1000 );

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        const shapes = { box:   new Cube(),
                         box_2: new Cube(),
                         axis:  new Axis_Arrows(),
                         myShape: new Octahedron(),
                         cylinder: new Rounded_Capped_Cylinder( 11,11 ),
                         cylinder2: new Rounded_Capped_Cylinder( 3, 6 ),
                         hollow_cylinder: new Cylindrical_Tube( 11, 11),
                         gridsphere: new ( Grid_Sphere.prototype.make_flat_shaded_version() )( 3,5),
                         square: new Square(),
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),
                         sphere1: new Subdivision_Sphere(3),
                         sphere2: new Subdivision_Sphere(5),
                         rock1:    new (Subdivision_Sphere.prototype.make_flat_shaded_version())(1) ,
                         rock2:    new Subdivision_Sphere(1),
                         windMill1: new Windmill(8),
                         pyramid: new Pyramid(), 
                         E_triangle: new Equilateral_triangle(),


                       }
            var TCHC = 0.2

           shapes.box.texture_coords = [


                                        Vec.of(0,0),   
                                        Vec.of(1,0),   
                                        Vec.of(0,1),
                                        Vec.of(1,1),
                                        Vec.of(0,0),
                                        Vec.of(1,0),
                                        Vec.of(0,1),
                                        Vec.of(1,1),
                                        Vec.of(0,0),
                                        Vec.of(1,0), 
                                        Vec.of(0,1),
                                        Vec.of(1,1),
                                        Vec.of(0,0),
                                        Vec.of(1,0), 
                                        Vec.of(0,1),    
                                        Vec.of(1,1), 
                                        Vec.of(0,0),   
                                        Vec.of(1,0),   
                                        Vec.of(0,1),    
                                        Vec.of(1,1), 
                                        Vec.of(0,0),   
                                        Vec.of(1,0),   
                                        Vec.of(0,1),    
                                        Vec.of(1,1) 
        ]; 
        this.submit_shapes( context, shapes );

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when 
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials =
          { phong: context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
            brick: context.get_instance( Texture_1).material( Color.of( 0,0,0,1 ), {ambient:0.8  , diffusivity: .4, texture: context.get_instance( "assets/default_brick.png", true) } ),
            rock: context.get_instance( Texture_1  ).material( Color.of( 0,0,0,1 ), {ambient:1, texture: context.get_instance( "assets/default_cobble.png", true) } ),
            rock2: context.get_instance( Texture_1  ).material( Color.of( 0,0,0,1 ), {ambient:1, texture: context.get_instance( "assets/default_mossycobble.png", true) } ),

            wood: context.get_instance( Texture_1  ).material( Color.of( 0,0,0,1 ), {ambient:1, diffusivity:0, texture: context.get_instance( "assets/default_pine_tree.png", true) } ),
            wood2: context.get_instance( Texture_1  ).material( Color.of( 0,0,0,1 ), {ambient:1, diffusivity:0, texture: context.get_instance( "assets/default_wood.png", true) } ),
            wood3: context.get_instance( Texture_1  ).material( Color.of( 0,0,0,1 ), {ambient:1, diffusivity:0, texture: context.get_instance( "assets/wood.jpg", true) } ),
            leave: context.get_instance( Texture_1  ).material( Color.of( 0,0,0,1 ), {ambient:0.6, diffusivity:1, texture: context.get_instance( "assets/default_leaves_simple.png", true) } ),
            stonebrick: context.get_instance( Texture_1).material( Color.of( 0,0,0,1 ), {ambient:0.8  , diffusivity: .4, texture: context.get_instance( "assets/default_cobble.png", true) } ),
            grass4: context.get_instance( Texture_1  ).material( Color.of( 0,0,0,1 ), {ambient:0.6, diffusivity:0.5, texture: context.get_instance( "assets/default_grass_4.png", true) } ),
            grass3: context.get_instance( Texture_1  ).material( Color.of( 0,0,0,1 ), {ambient:0.6, diffusivity:0.5, texture: context.get_instance( "assets/default_grass_3.png", true) } ),
            grass5: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient:0.6, diffusivity:0.5, texture: context.get_instance( "assets/default_grass_5.png", true) } ),

            Sign:   context.get_instance( Texture_Scroll_X  ).material( Color.of( 0,0,0,1 ), {ambient:1, texture: context.get_instance( "assets/TV.jpg", false) } ),


            light:   context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:1} ),
            light1:  context.get_instance( Texture_1 ).material( Color.of( 0,0,0,1 ), {ambient:1, diffusivity:0, texture: context.get_instance( "assets/gui_formbg.png", true) } ),


          }

        this.coffinBlack = context.get_instance( Phong_Shader ).material( Color.of( 0.216, 0.216, 0.216, 1 ));

        this.clay   = context.get_instance( Phong_Shader ).material( Color.of( .9,.5,.9, 1 ), { ambient: .4, diffusivity: .4 } );
        this.white  = context.get_instance( Basic_Shader ).material();
        this.plastic = this.clay.override({ ambient: 0.5, specularity: 1 });
        this.clay2   = context.get_instance( Phong_Shader ).material( Color.of( 0.6,0.4,0.8, 1 ), { ambient: .4, diffusivity: .4 } );



        this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];
        this.longbrick = Mat4.identity();
        this.brickwall_transform = Mat4.identity();
        this.rockwall_transform = Mat4.identity();
        // TODO:  Create any variables that needs to be remembered from frame to frame, such as for incremental movements over time.

      }
      make_control_panel()
      { // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button( "start and stop the rotation both cubes",    [ "c" ], () => {
          
          this.stay      ^= 1
          });
      }


      made_plus_and_stones(graphics_state, translate)
      {

        graphics_state.lights = this.lights;        // Use the lights stored in this.lights.

        
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation(translate));

        let adjust = model_transform;

        model_transform = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 0, 0, 1))).times(Mat4.scale ([ 2, 0.5,0.2]));

       this.shapes.box.draw(graphics_state, model_transform, this.materials.wood2);

       model_transform = model_transform.times(Mat4.rotation( 3*Math.PI/2, Vec.of( 0, 0, 1))).times(Mat4.scale ([ 3, 0.2,0.7])).times(Mat4.translation([0, 2, 0]));
       this.shapes.box.draw(graphics_state, model_transform, this.materials.wood2);

       let stone = Mat4.identity();
       let stone2 = Mat4.identity();

       stone= adjust.times(Mat4.translation([0,-1.6,2])).times(Mat4.scale([0.3,0.3,0.3 ]));
       stone = stone.times(Mat4.translation([-2,0,0] ));
       stone2 = adjust.times(Mat4.translation([0.7,-1.6,4])).times(Mat4.scale([0.3,0.3,0.4 ]));
      stone2 = stone2.times(Mat4.translation([-1.5,0,-1] ));

       this.shapes.rock2.draw(graphics_state, stone, this.materials.rock);
        // this.shapes.rock2.draw(graphics_state, stone2, this.materials.rock2);

        var k =2;

        for (var j =0; j < 6; j ++)
        {
          for (var i= 0; i< 3; i++)
          {
           stone = stone.times(Mat4.translation([1,0,0] )).times(Mat4.rotation(Math.PI/5, Vec.of(0,0,1)));
           this.shapes.rock2.draw(graphics_state, stone, this.materials.rock);
          }
          stone = stone.times(Mat4.translation([-2,0,2] ));
          this.shapes.rock2.draw(graphics_state, stone, this.materials.rock);

        }

        stone = stone.times(Mat4.translation([-1,0,-6] ));

        for (var j =0; j < 6; j ++)
        {
          for (var i= 0; i< 8; i++)
          {
           stone = stone.times(Mat4.translation([1,0,0] )).times(Mat4.rotation(Math.PI/5, Vec.of(0,0,1)));
           this.shapes.rock2.draw(graphics_state, stone, this.materials.rock);
          }
          stone = stone.times(Mat4.translation([-2,0,2] ));
          this.shapes.rock2.draw(graphics_state, stone, this.materials.rock);

        }


        for (var j =0; j < 6; j ++)
        {
          for (var i= 0; i< 4; i++)
          {
           stone2= stone2.times(Mat4.translation([1,0,0] )).times(Mat4.rotation(Math.PI/4, Vec.of(0,0,1)));
           this.shapes.rock2.draw(graphics_state, stone2, this.materials.rock2);
          }
          stone2 = stone2.times(Mat4.translation([-2,0,2] ));
          this.shapes.rock2.draw(graphics_state, stone2, this.materials.rock2);

        }

        stone2 = stone2.times(Mat4.translation([-4.5,0,-12] ));
        for (var j =0; j < 6; j ++)
        {
          for (var i= 0; i< 4; i++)
          {
           stone2= stone2.times(Mat4.translation([1,0,0] )).times(Mat4.rotation(Math.PI/4, Vec.of(0,0,1)));
           this.shapes.rock2.draw(graphics_state, stone2, this.materials.rock2);
          }
          stone2 = stone2.times(Mat4.translation([-2,0,2] ));
          this.shapes.rock2.draw(graphics_state, stone2, this.materials.rock2);

        }




        return;
      }

      make_pyramid( graphics_state, translate)
      {
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation(translate));

        this.shapes.pyramid.draw(graphics_state, model_transform, this.materials.stonebrick);



        return;
      }

    

    make_longstonebrick(graphics_state, translate)
    {

      let model_transform = Mat4.identity();

       model_transform = Mat4.identity(); 

      model_transform = model_transform.times(Mat4.translation(translate));
      for (var i= 0; i< 5; i++)
      {
        this.shapes.box.draw(graphics_state, model_transform, this.materials.stonebrick);
        model_transform = model_transform.times(Mat4.translation([0, 2,0]));

      }
      

      return;
    }
    make_longbrick(graphics_state,  translate )
    {

      graphics_state.lights = this.lights;

      let model_transform = Mat4.identity(); 

      model_transform = model_transform.times(Mat4.translation(translate));
      for (var i= 0; i< 5; i++)
      {
        this.shapes.box.draw(graphics_state, model_transform, this.materials.brick);
        model_transform = model_transform.times(Mat4.translation([0, 2,0]));

      }
      
      return;
    }


    make_brickwall_side(graphics_state, x, y, z)
    {

      graphics_state.lights = this.lights;

      
      this.make_longbrick( graphics_state, [x,y,z]);
      let loc = y;
      for(var i =0; i< 11; i++)
      {
        this.make_longbrick( graphics_state, [x,y,loc]);
        loc -= 1
      }

      return;
    }


    make_brickwall_face(graphics_state,x, y ,z)
    {
      graphics_state.lights = this.lights;

      this.make_longbrick( graphics_state, [x,y,z]);

      let loc = x;
      
      for(var i =0; i< 14; i++)
      {
        this.make_longbrick( graphics_state, [loc,y,z]);
        loc += 1
      }
      return ;
      
    }

    make_rock_rod ( graphics_state, translate)
    {

      graphics_state.lights = this.lights;
      
      let model_transform = Mat4.identity(); 

      model_transform = model_transform.times(Mat4.scale([0.2 ,0.2, 0.2 ]))
                                       .times(Mat4.rotation (Math.PI/2, Vec.of( 1, 0, 0 ) ))
                                       .times(Mat4.translation([0,0,4])).times(Mat4.translation(translate));
      this.shapes.cylinder.draw(graphics_state, model_transform, this.materials.rock);

      for (var i =0; i < 60 ; i++)
      {
        this.shapes.cylinder.draw(graphics_state, model_transform, this.materials.rock);
        model_transform = model_transform.times(Mat4.translation([0,0,-0.6])); 
      }
      return;

    }

     make_rock_fence_face( graphics_state, x,y,z)
    {
      this.make_rock_rod( graphics_state, [x,y,z]);
      let loc = x;
      for(var i =0; i< 9; i++)
      {
        this.make_rock_rod( graphics_state, [loc,y,z]);
        loc += 6
      }
      return;
    }


     make_rock_fence_side( graphics_state, x,y,z)
    {
      this.make_rock_rod( graphics_state, [x,y,z]);

      let loc = y;
      
      for(var i =0; i< 9; i++)
      {
        this.make_rock_rod( graphics_state, [x,loc,z]);
        loc += 6
      }
      return;
    }

    make_coffin( graphics_state, x ,y,z)  //*Coffine cannot be scaled. If needed, you have to work for --|------ again.
    {

      
      let model_transform = Mat4.identity();
      let plus =Mat4.identity();
      let plus1 = Mat4.identity();
      model_transform = model_transform.times(Mat4.translation([x,y,z]));
      model_transform = model_transform.times(Mat4.rotation(-Math.PI/8  ,Vec.of(1,0,0))).times(Mat4.scale([2,5,1]));

      plus = model_transform.times(Mat4.translation([0,0.4,0.6])).times(Mat4.scale([ 0.5, 0.06, 1]));
      plus1 = model_transform.times(Mat4.translation([0,0.2,0.6])).times(Mat4.scale([ 0.2, 0.5, 1]));
     
      this.shapes.cylinder2.draw(graphics_state,model_transform,this.materials.wood);
      this.shapes.square.draw(graphics_state,plus,this.coffinBlack)  ;
      this.shapes.square.draw(graphics_state,plus1,this.coffinBlack) ;

      return;
    }

    make_welcomeBoard(graphics_state, translate)
    {
      let model_transform = Mat4.identity();
      model_transform = model_transform.times(Mat4.translation(translate));

      model_transform =model_transform.times(Mat4.rotation(Math.PI/5,Vec.of(0,1,0)));

      let sign = Mat4.identity();
      sign = model_transform.times(Mat4.translation([0,0,0.4])).times(Mat4.scale([4,1.7,0.2]));

      model_transform= model_transform.times(Mat4.scale([5,2,0.2]));

    

      this.shapes.box.draw(graphics_state, model_transform, this.materials.wood3);

     model_transform = model_transform.times(Mat4.scale([0.06,2.5,0.2])).times(Mat4.translation([-14,-0.5,0]));
      this.shapes.box.draw(graphics_state, model_transform, this.materials.wood3);
      model_transform = model_transform.times(Mat4.translation([28,0,0]));
      this.shapes.box.draw(graphics_state, model_transform, this.materials.wood3);


     this.shapes.square.draw(graphics_state, sign, this.materials.Sign);





      return;
    }

    make_Lamp( graphics_state, x, y, z)
    {

      const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

      let tor1 = Mat4.identity();
      let model_transform = Mat4.identity();
      let scale = 2+Math.cos(2*Math.PI/5);     

      let lightColor = Color.of( 0.1, 0.84, 1,1); 
      model_transform = model_transform.times(Mat4.translation([x,y,z]));

      this.lights = [ new Light( Vec.of( x,y,z,1 ),lightColor , 1000000 ) ]; 

      this.shapes.sphere2.draw(graphics_state,model_transform, this.materials.light.override({color: lightColor}));


      tor1 = model_transform.times(Mat4.translation([0,-1,0])).times(Mat4.rotation(Math.PI/2, Vec.of( 1, 0, 0 ) )).times(Mat4.scale([0.5,0.5,0.5]));
      this.shapes.torus2.draw(graphics_state, tor1, this.materials.wood);

      return;

    }




    make_tree ( graphics_state, x,y,z)
    {
       graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
      let model_transform = Mat4.identity();
      let branch1 = Mat4.identity();
      let branch2 = Mat4.identity();
      let branch3 = Mat4.identity();
      var BarScX = 8
      var BarScY = 1
      var BarScZ = 1

      var c = 1;
      model_transform= model_transform.times(Mat4.translation([x,y,z]));
      for(var i =0; i < 4; i++)
      {
        model_transform = model_transform.times( Mat4.translation([ c,0,0 ]));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,-c,0 ])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ -c,c,c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,0,-c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ 0,-c,c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
        model_transform = model_transform.times( Mat4.translation([ 0,-c,-c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 1, 0  ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
      }

      branch1 = model_transform.times(Mat4.translation([1,-2,0])).times(Mat4.scale([ 0.2, 2, 0.2]));
      this.shapes.cylinder.draw(graphics_state,branch1, this.materials.wood);

      model_transform = model_transform.times(Mat4.translation([4,0,1]));
      for(var i =0; i < 4; i++)
      {
        model_transform = model_transform.times( Mat4.translation([ c,0,0 ]));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,-c,0 ])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ -c,c,c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,0,-c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ 0,-c,c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
        model_transform = model_transform.times( Mat4.translation([ 0,-c,-c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 1, 0  ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 

      }

      branch2 = model_transform.times(Mat4.translation([1,-2,0])).times(Mat4.scale([ 0.2, 3, 0.2])).times(Mat4.rotation(Math.PI/4, Vec.of( 1, 0, 0 )));
      this.shapes.cylinder.draw(graphics_state,branch2, this.materials.wood);


      model_transform = model_transform.times(Mat4.translation([-3,-2,1]));
      for(var i =0; i < 4; i++)
      {
        model_transform = model_transform.times( Mat4.translation([ c,0,0 ]));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,-c,0 ])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ -c,c,c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,0,-c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ 0,-c,c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
        model_transform = model_transform.times( Mat4.translation([ 0,-c,-c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 1, 0  ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
      }
      


      model_transform = model_transform.times(Mat4.translation([-5,-4,1]));
      for(var i =0; i < 4; i++)
      {
        model_transform = model_transform.times( Mat4.translation([ c,0,0 ]));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,-c,0 ])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ -c,c,c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,0,-c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ 0,-c,c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
        model_transform = model_transform.times( Mat4.translation([ 0,-c,-c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 1, 0  ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
      }

      branch3 = model_transform.times(Mat4.translation([0,1,-2])).times(Mat4.rotation(Math.PI/-9, Vec.of( -2 , 10, 0  ))).times(Mat4.scale([ 0.2, 0.2, 4]));
      this.shapes.cylinder.draw(graphics_state,branch3, this.materials.wood);

      model_transform = model_transform.times(Mat4.translation([2,-1,1]));
      for(var i =0; i < 4; i++)
      {
        model_transform = model_transform.times( Mat4.translation([ c,0,0 ]));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,-c,0 ])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ -c,c,c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,0,-c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ 0,-c,c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
        model_transform = model_transform.times( Mat4.translation([ 0,-c,-c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 1, 0  ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
      }

      branch3 = model_transform.times(Mat4.translation([0,1,-2])).times(Mat4.rotation(Math.PI, Vec.of( 1, 0, 0  ))).times(Mat4.scale([ 0.2, 0.2, 4]));
      this.shapes.cylinder.draw(graphics_state,branch3, this.materials.wood);


       model_transform = model_transform.times(Mat4.translation([2,2,1]));

      for(var i =0; i < 4; i++)
      {
        model_transform = model_transform.times( Mat4.translation([ c,0,0 ]));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,-c,0 ])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ -c,c,c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,0,-c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ 0,-c,c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
        model_transform = model_transform.times( Mat4.translation([ 0,-c,-c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 1, 0  ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
      }


       model_transform = model_transform.times(Mat4.translation([-3,-2,1]));

      for(var i =0; i < 4; i++)
      {
        model_transform = model_transform.times( Mat4.translation([ c,0,0 ]));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,-c,0 ])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ -c,c,c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,0,-c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ 0,-c,c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
        model_transform = model_transform.times( Mat4.translation([ 0,-c,-c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 1, 0  ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
      }
      model_transform = model_transform.times(Mat4.translation([-3,-2,1]));

      for(var i =0; i < 4; i++)
      {
        model_transform = model_transform.times( Mat4.translation([ c,0,0 ]));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,-c,0 ])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ -c,c,c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 0 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ c,0,-c ])).times(Mat4.rotation( Math.PI/4, Vec.of( 0, 1, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
         model_transform = model_transform.times( Mat4.translation([ 0,-c,c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 0, 1 ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
        model_transform = model_transform.times( Mat4.translation([ 0,-c,-c])).times(Mat4.rotation( Math.PI/4, Vec.of( 1, 1, 0  ) ));
        this.shapes.windMill1.draw(graphics_state, model_transform, this.materials.leave); 
      }
      

      return; 

    }



    display_playground(graphics_state)
    {
        graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
        
        var loc = 0;

       
        loc =0
        for (var i =0 ; i< 30; i++)
        {
          this.make_brickwall_side(graphics_state, -46, 0, loc);
          loc -=2
        }

        loc =0;
        for (var i =0 ; i< 4; i++)
        {
          this.make_brickwall_face(graphics_state, loc, 0, -58);
          loc -= 15;

        }
        loc =0;
        for (var i =0 ; i< 30; i++)
        {
          this.make_brickwall_side(graphics_state, 14, 0, loc);
          loc -=2
        }

        this.make_tree(graphics_state,-36,0,-55);

        this.make_rock_fence_face( graphics_state, -220,-20,0) ;

        this.make_rock_fence_side( graphics_state, -165,-65,0) ;

        this.make_rock_fence_face( graphics_state, -220,-70,0) ;

        this.make_coffin(graphics_state, -40, 0,-13);


        this.make_longstonebrick(graphics_state, [ 0, 0, -20]);
        this.make_Lamp(graphics_state, 0,10.5 ,-20);

        this.make_longstonebrick(graphics_state, [ -20, 0, -20]);
        this.make_Lamp(graphics_state, -20,10.5 ,-20);


        var k =0;
        
          for ( var j=0; j < 4; j ++)
          {

            this.made_plus_and_stones(graphics_state, [k,0,0]);
            k -= 5;
          }

          k = 0;

          for ( var j=0; j < 4; j ++)
          {

            this.made_plus_and_stones(graphics_state, [k,0,-10]);
            k -= 5;
          }
          

          this.make_welcomeBoard(graphics_state, [-34,0,0]);


    }

    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;


          this.display_playground(graphics_state);


          // this.make_pyramid(graphics_state, [0,0,0]);


            // this.make_tree(graphics_state,0,0,0);

             // this.make_Lamp(graphics_state, 0,0,0);
             // this.make_longbrick(graphics_state, [ 3, 0, 0]);
             // this.make_brickwall_face(graphics_state, 0, 0, 0);
             // this.make_brickwall_side(graphics_state, 0,0,0);
             // this.make_coffin(graphics_state, 0 , 0, 0);
             // this.make_rock_rod(graphics_state, [0,0,0]);
             // this.make_rock_fence_face( graphics_state, 0,0,0) ;
             // this.make_rock_fence_side( graphics_state, 0,0,0) ;
             // this.make_room(graphics_state, Mat4.identity());
      // if(this.stay)
      //   {
      //       this.cube1_model_transform.post_multiply(Mat4.rotation( dt*Math.PI, Vec.of( 1,0,0 ) ));
      //       this.cube2_model_transform.post_multiply(Mat4.rotation( dt*2*Math.PI/3, Vec.of( 0,1,0 ) ));
      //   }
      
           // this.shapes.box.draw( graphics_state, this.brickwall_transform, this.materials.brick );
      //   this.shapes.box_2.draw( graphics_state, this.cube2_model_transform, this.materials.rock );
      //   this.shapes.myShape.draw(graphics_state, Mat4.translation([0,-3,0]), this.materials.phong);
        
        // TODO:  Draw the required boxes. Also update their stored matrices.
        // this.shapes.axis.draw( graphics_state, Mat4.identity(), this.materials.phong );
      }
  }





class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          
                                 // Sample the texture image in the correct place.
          vec2 new_tex_coord = f_tex_coord;
          new_tex_coord[0] += mod(animation_time,1.0);
          // new_tex_coord[1] += mod(animation_time,1.0);

          vec4 tex_color = texture2D( texture, new_tex_coord ); 
                                                                              // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}


class Texture_1 extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
      return `
 uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

