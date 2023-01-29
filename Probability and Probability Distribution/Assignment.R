####Problem 1 

#Ans: (i)

x<-0:9
freq <- c(144,342,142,72,39,20,6,9,2,1)
rel_freq <- freq/sum(freq)
cum_rel_freq <- cumsum(rel_freq)
cum_freq <- cumsum(freq)
rel_freq
cum_rel_freq
cum_freq
df <- data.frame(x,freq,rel_freq,cum_rel_freq,cum_freq)
df

#Ans: (ii)

##first graph
x<-0:9
freq <- c(144,342,142,72,39,20,6,9,2,1)
rel_freq <- freq/sum(freq)
png(file = "probbar.png")
rel_feq
barplot(rel_feq,main = "Probability Distribution Chart",
        ylab="(Density)",xlab="(Number of Substances)",
        names.arg = c("0", "1", "2", "3", "4", "5", "6","7","8","9"),
        col = "darkred",border="yellow")
dev.off()

##Second Graph
x<-0:9
freq <- c(144,342,142,72,39,20,6,9,2,1)
rel_freq <- freq/sum(freq)
cum_rel_freq <- cumsum(rel_freq)
png(file = "cum.png")
plot(x,cum_rel_freq, xlab="Number of Substances",ylab="Probability",
     main="Cumulative Probability Distribution",
     type="o",pch=20,lwd=2, col="darkred")
dev.off()


#Ans: (iii)
x<-0:9
freq <- c(144,342,142,72,39,20,6,9,2,1)
rel_freq <- freq/sum(freq)
desired_freq <- freq[x>6]
desired_freq
prob <- sum(desired_freq/sum(freq))
prob

##Problem 2
##Ans (i)
x <- 600:1000
x
x1 <- pnorm(600, mean=870, sd=211)
x1
x2<- pnorm(1000, mean=870, sd=211)
x2
y <- x2-x1
y

##Ans (ii)

x <- c(900)
x1 <- 1- pnorm(x2, mean=870, sd=211)
x1
##Ans (iii)
x <- c(500)
x1 <- pnorm(x3, mean=870, sd=211)
x1

#Ans (iv)
x <- 900:1100
x1 <- pnorm(900, mean=870, sd=211)
x2<- pnorm(1100, mean=870, sd=211)
y<- x2-x1
y
