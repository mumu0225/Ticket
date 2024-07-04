package com.example.springboot_jwt_demo;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String account;

    private String pwd;

    private int userStatus;

    private String cinemaId;

    public User(long id,String account,String pwd,int userStatus,String cinemaId)
    {
    	this.id=id;
    	this.account=account;
    	this.pwd=pwd;
    	this.userStatus=userStatus;
    	this.cinemaId=cinemaId;
    }
    
    public User() {
        // 无参构造函数
    }
    
	public String getAccount() {
		return account;
	}

	public void setAccount(String account) {
		this.account = account;
	}

	public String getPwd() {
		return pwd;
	}

	public void setPwd(String pwd) {
		this.pwd = pwd;
	}

	public Integer getUserStatus() {
		return userStatus;
	}

	public void setUserStatus(Integer userStatus) {
		this.userStatus = userStatus;
	}

	public String getCinemaId() {
		return cinemaId;
	}

	public void setCinemaId(String cinemaId) {
		this.cinemaId = cinemaId;
	}

}
