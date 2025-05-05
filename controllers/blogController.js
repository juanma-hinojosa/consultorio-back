const Blog = require('../models/BlogPost');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, folder = 'blogs') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const createBlog = async (req, res) => {
    try {
        const {
            title,
            intro,
            category,
            contentParagraph,
            extraSections,
        } = req.body;

        const mainImage = req.files['mainImage']?.[0];
        const contentImages = req.files['contentImages'] || [];
        const extraImages = req.files['extraImages'] || [];

        // Subir imagen principal
        const mainImageUrl = await uploadToCloudinary(mainImage.buffer);

        // Subir imágenes del contenido
        const contentImagesUrls = [];
        for (const img of contentImages) {
            const url = await uploadToCloudinary(img.buffer);
            contentImagesUrls.push(url);
        }

        // Procesar secciones extra
        const extraSectionsParsed = JSON.parse(extraSections);
        const extraSectionsWithImages = [];

        for (let i = 0; i < extraSectionsParsed.length; i++) {
            const paragraph = extraSectionsParsed[i].paragraph;
            const imageFile = extraImages[i];
            let imageUrl = '';

            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile.buffer);
            }

            extraSectionsWithImages.push({ paragraph, imageUrl });
        }

        const blog = new Blog({
            title,
            intro,
            category,
            mainImageUrl,
            contentParagraph,
            contentImagesUrls,
            extraSections: extraSectionsWithImages,
        });

        const saved = await blog.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error creando blog:', err);
        res.status(500).json({ error: 'Error al crear el blog' });
    }
};

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener blogs' });
    }
};



const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog no encontrado' });
        res.status(200).json({ message: 'Blog eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar blog' });
    }
};

// const updateBlog = async (req, res) => {
//     try {
//         const blogId = req.params.id;
//         const {
//             title,
//             intro,
//             category,
//             contentParagraph,
//             extraSections
//         } = req.body;

//         const mainImage = req.files['mainImage']?.[0];
//         const contentImages = req.files['contentImages'] || [];
//         const extraImages = req.files['extraImages'] || [];

//         const blog = await Blog.findById(blogId);
//         if (!blog) return res.status(404).json({ message: 'Blog no encontrado' });

//         // Actualizar campos de texto
//         blog.title = title;
//         blog.intro = intro;
//         blog.category = category;
//         blog.contentParagraph = contentParagraph;

//         // Reemplazar imagen principal si llega una nueva
//         if (mainImage) {
//             const mainImageUrl = await uploadToCloudinary(mainImage.buffer);
//             blog.mainImageUrl = mainImageUrl;
//         }

//         // Reemplazar imágenes del contenido si se suben nuevas
//         if (contentImages.length > 0) {
//             const contentImagesUrls = [];
//             for (const img of contentImages) {
//                 const url = await uploadToCloudinary(img.buffer);
//                 contentImagesUrls.push(url);
//             }
//             blog.contentImagesUrls = contentImagesUrls;
//         }

//         // Actualizar secciones extra
//         if (extraSections) {
//             const extraSectionsParsed = JSON.parse(extraSections);
//             const updatedExtraSections = [];

//             for (let i = 0; i < extraSectionsParsed.length; i++) {
//                 const paragraph = extraSectionsParsed[i].paragraph;
//                 // let imageUrl = blog.extraSections?.[i]?.imageUrl || '';

//                 // if (extraImages[i]) {
//                 //     imageUrl = await uploadToCloudinary(extraImages[i].buffer);
//                 // }

//                 // updatedExtraSections.push({ paragraph, imageUrl });
//                 const sectionImages = req.files[`extraImages-${i}`] || [];

//                 let imageUrls = blog.extraSections?.[i]?.imageUrl || [];

//                 if (sectionImages.length > 0) {
//                     imageUrls = [];
//                     for (const img of sectionImages) {
//                         const url = await uploadToCloudinary(img.buffer);
//                         imageUrls.push(url);
//                     }
//                 }

//                 updatedExtraSections.push({ paragraph, imageUrl: imageUrls });

//             }

//             blog.extraSections = updatedExtraSections;
//         }

//         const updated = await blog.save();
//         res.status(200).json(updated);
//     } catch (err) {
//         console.error('Error al actualizar blog:', err);
//         res.status(500).json({ error: 'Error al actualizar el blog' });
//     }
// };



const updateBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const { title, intro, category, contentParagraph, extraSections } = req.body;

        if (!title || !intro || !category || !contentParagraph) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const mainImage = req.files['mainImage']?.[0];
        const contentImages = req.files['contentImages'] || [];
        const extraImages = req.files['extraImages'] || [];

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ message: 'Blog no encontrado' });

        blog.title = title;
        blog.intro = intro;
        blog.category = category;
        blog.contentParagraph = contentParagraph;

        if (mainImage) {
            const mainImageUrl = await uploadToCloudinary(mainImage.buffer);
            blog.mainImageUrl = mainImageUrl;
        }

        if (contentImages.length > 0) {
            const contentImagesUrls = [];
            for (const img of contentImages) {
                const url = await uploadToCloudinary(img.buffer);
                contentImagesUrls.push(url);
            }
            blog.contentImagesUrls = contentImagesUrls;
        }

        if (extraSections) {
            let extraSectionsParsed = [];
            try {
                extraSectionsParsed = JSON.parse(extraSections);
            } catch (err) {
                return res.status(400).json({ error: 'Error al procesar las secciones extra' });
            }

            const updatedExtraSections = [];
            for (let i = 0; i < extraSectionsParsed.length; i++) {
                const paragraph = extraSectionsParsed[i].paragraph;
                const sectionImages = req.files[`extraImages-${i}`] || [];
                let imageUrls = [];

                if (sectionImages.length > 0) {
                    for (const img of sectionImages) {
                        const url = await uploadToCloudinary(img.buffer);
                        imageUrls.push(url);
                    }
                } else {
                    // Si no hay imágenes, asegúrate de que imageUrl sea un string vacío, no un array.
                    imageUrls = '';
                }

                updatedExtraSections.push({ paragraph, imageUrl: imageUrls });
            }

            blog.extraSections = updatedExtraSections;
        }

        const updated = await blog.save();
        res.status(200).json(updated);
    } catch (err) {
        console.error('Error al actualizar blog:', err);
        res.status(500).json({ error: 'Error al actualizar el blog', details: err.message });
    }
};



const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog no encontrado' });
        res.status(200).json(blog);
    } catch (err) {
        console.error('Error al obtener blog por ID:', err);
        res.status(500).json({ error: 'Error al obtener el blog' });
    }
};


module.exports = {
    createBlog,
    getAllBlogs,
    deleteBlog,
    updateBlog,
    getBlogById
};

