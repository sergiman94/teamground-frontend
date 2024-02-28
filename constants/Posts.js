export default [
    {
        description: 'Esta es la descripcion de un post de una foto en el feed',
        name: 'Jhon Doe',
        userImage: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
        image: 'https://www.las2orillas.co/wp-content/uploads/2019/06/cancha.png',
        likes: ['asdadasdad', 'acasddsada', 'wqwe12ewe'],
        cta: 'Ver Lugar', 
        horizontal: true,
        comments: [
            {   name: 'User29320', 
                userImage: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
                content: 'hey !!'
            },
        ]
    },

    {
        description: 'Esta es la descripcion de un post normal en el feed',
        name: 'Jhon Doe',
        image: null,
        userImage: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
        likes: ['asdadasdad', 'acasddsada', 'wqwe12ewe'],
        cta: 'Ver Lugar', 
        horizontal: true,
        comments: [
            {   name: 'user1231', 
                userImage: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
                content: 'Si es cierto !!'
            },
            {   name: 'Sergio',
                userImage: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',  
                content: 'Vamos por ello !'
            },
            {   name: 'Carl',
                userImage: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png', 
                content: 'No claro que no'
            }
        ]
    }

]